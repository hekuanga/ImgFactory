import { NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabaseClient } from '../../lib/supabaseClient';
import { useIsAuthenticated } from '../../hooks/useAuth';
import { useBillingPortal } from '../../hooks/useBillingPortal';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface SubscriptionStatus {
  isSubscribed: boolean;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: string | null;
  subscriptionTier?: string | null;
  currentPeriodEnd?: string | null;
}

// 套餐配置
interface PlanConfig {
  id: 'basic' | 'vip';
  name: string;
  priceId: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const PLANS: PlanConfig[] = [
  {
    id: 'basic',
    name: '基础套餐',
    priceId: 'price_1SUPEqE6jQ7bHhFk5Fo2FhDL',
    description: '适合个人用户的基础功能',
    features: [
      '照片修复功能',
      '基础证件照生成',
      '标准处理速度',
    ],
  },
  {
    id: 'vip',
    name: 'VIP 套餐',
    priceId: 'price_1SUlfuE6jQ7bHhFk80MEzlpa',
    description: '享受所有高级功能和优先支持',
    features: [
      '所有基础功能',
      '高级照片修复',
      '专业证件照生成',
      '优先处理速度',
      '专属客服支持',
    ],
    popular: true,
  },
];

const Billing: NextPage = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useIsAuthenticated();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanConfig | null>(null);
  const { openPortal, loading: portalLoading } = useBillingPortal();

  // 获取订阅状态
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (authLoading) return;

      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/billing/status', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        const data = await response.json();

        if (data.success && data.subscription) {
          setSubscription(data.subscription);
        } else {
          setError(data.error || '获取订阅状态失败');
        }
      } catch (err) {
        console.error('Fetch subscription status error:', err);
        setError('获取订阅状态失败');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [isAuthenticated, authLoading, router]);

  // 处理订阅按钮点击
  const handleSubscribe = async (plan: PlanConfig) => {
    setCheckoutLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // 调用 API 创建 Checkout Session，传递选中的套餐价格 ID
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          priceId: plan.priceId, // 传递选中的套餐价格 ID
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        // 重定向到 Stripe Checkout
        window.location.href = data.url;
      } else {
        setError(data.error || '创建支付会话失败');
        setCheckoutLoading(false);
      }
    } catch (err) {
      console.error('Subscribe error:', err);
      setError('订阅失败，请重试');
      setCheckoutLoading(false);
    }
  };

  // 处理管理订阅按钮点击
  const handleManageSubscription = async () => {
    setError('');
    try {
      await openPortal(`${window.location.origin}/billing`);
    } catch (err) {
      setError('打开管理页面失败，请重试');
    }
  };

  if (authLoading || loading) {
    return (
      <div className='flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen'>
        <Head>
          <title>订阅管理 - 照片修复工具</title>
        </Head>
        <Header />
        <main className='flex flex-1 w-full flex-col items-center justify-center px-4 mt-20'>
          <div className='text-center'>加载中...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className='flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen'>
      <Head>
        <title>订阅管理 - 照片修复工具</title>
      </Head>
      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-center px-4 mt-20'>
        <div className='w-full max-w-md'>
          <h1 className='text-3xl font-bold text-center mb-8 text-slate-900'>
            订阅管理
          </h1>

          {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6'>
              {error}
            </div>
          )}

          {subscription && subscription.isSubscribed && (
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6'>
              <h2 className='text-lg font-semibold mb-4 text-slate-900'>当前订阅状态</h2>
              
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>订阅状态：</span>
                  <span className='font-medium text-green-600'>已订阅</span>
                </div>

                {subscription.subscriptionTier && (
                  <div className='flex justify-between'>
                    <span className='text-slate-600'>订阅等级：</span>
                    <span className='font-medium capitalize'>
                      {subscription.subscriptionTier === 'vip' ? 'VIP' : subscription.subscriptionTier === 'pro' ? '基础' : subscription.subscriptionTier}
                    </span>
                  </div>
                )}

                {subscription.subscriptionStatus && (
                  <div className='flex justify-between'>
                    <span className='text-slate-600'>状态详情：</span>
                    <span className='font-medium'>{subscription.subscriptionStatus}</span>
                  </div>
                )}

                {subscription.currentPeriodEnd && (
                  <div className='flex justify-between'>
                    <span className='text-slate-600'>到期时间：</span>
                    <span className='font-medium'>
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                )}
              </div>

              <div className='mt-4'>
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className='w-full bg-[#3290EE] text-white font-medium px-4 py-3 rounded-lg hover:bg-[#3290EE]/80 transition disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {portalLoading ? '处理中...' : '管理订阅'}
                </button>
              </div>
            </div>
          )}

          {!subscription?.isSubscribed && (
            <>
              <h2 className='text-xl font-semibold text-center mb-6 text-slate-900'>
                选择套餐
              </h2>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative border-2 rounded-lg p-6 ${
                      selectedPlan?.id === plan.id
                        ? 'border-[#3290EE] bg-blue-50'
                        : plan.popular
                        ? 'border-blue-300 bg-white'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {plan.popular && (
                      <div className='absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                        <span className='bg-[#3290EE] text-white text-xs font-medium px-3 py-1 rounded-full'>
                          推荐
                        </span>
                      </div>
                    )}

                    <div className='text-center mb-4'>
                      <h3 className='text-xl font-bold text-slate-900 mb-2'>{plan.name}</h3>
                      <p className='text-sm text-slate-600'>{plan.description}</p>
                    </div>

                    <ul className='space-y-2 mb-6'>
                      {plan.features.map((feature, index) => (
                        <li key={index} className='flex items-start text-sm text-slate-700'>
                          <span className='text-green-500 mr-2'>✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        handleSubscribe(plan);
                      }}
                      disabled={checkoutLoading}
                      className={`w-full font-medium px-4 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                        plan.popular
                          ? 'bg-[#3290EE] text-white hover:bg-[#3290EE]/80'
                          : 'bg-gray-100 text-slate-900 hover:bg-gray-200'
                      }`}
                    >
                      {checkoutLoading && selectedPlan?.id === plan.id
                        ? '处理中...'
                        : '选择此套餐'}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {!subscription?.isSubscribed && (
            <div className='mt-6 text-center'>
              <p className='text-sm text-slate-600'>
                订阅后即可享受所有高级功能
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Billing;

