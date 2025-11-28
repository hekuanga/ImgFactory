import { NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

const Credits: NextPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useTranslation();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const loadCredits = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await (await import('../lib/supabaseClient')).supabaseClient.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        const res = await fetch('/api/credits/balance', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        const data = await res.json();
        if (data.success) {
          setCredits(data.credits || 0);
        }
      } catch (error) {
        console.error('Load credits error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCredits();
  }, [user]);

  const handlePurchase = async (creditsAmount: number, price: number, packageId?: string) => {
    if (!user || processing) return;

    setProcessing(true);
    try {
      const { data: { session } } = await (await import('../lib/supabaseClient')).supabaseClient.auth.getSession();
      if (!session) {
        alert(language === 'zh' ? '请先登录' : 'Please login first');
        return;
      }

      // 调用Stripe Checkout API
      const res = await fetch('/api/credits/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          creditsAmount: creditsAmount, // 积分数量
          price: price, // 实际价格（澳币）
          packageId: packageId
        })
      });

      const data = await res.json();
      if (data.success && data.url) {
        // 重定向到Stripe Checkout页面
        window.location.href = data.url;
      } else {
        alert(data.error || (language === 'zh' ? '创建支付会话失败' : 'Failed to create payment session'));
        setProcessing(false);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert(language === 'zh' ? '充值失败，请稍后重试' : 'Purchase failed, please try again');
      setProcessing(false);
    }
  };

  const creditPackages = [
    { amount: 20, price: 9.9, bonus: 0, packageId: 'package_20' },
    { amount: 100, price: 39.9, bonus: 10, packageId: 'package_100' },
    { amount: 200, price: 69.9, bonus: 30, packageId: 'package_200' },
    { amount: 400, price: 129.9, bonus: 80, packageId: 'package_400' },
  ];

  if (authLoading || loading) {
    return (
      <div className='flex max-w-7xl mx-auto flex-col items-center justify-center min-h-screen bg-[#F7F4E9] dark:bg-slate-900'>
        <Header />
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-slate-600 dark:text-slate-400'>{t.user.loading}</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className='flex max-w-7xl mx-auto flex-col items-center justify-center min-h-screen bg-[#F7F4E9] dark:bg-slate-900'>
        <Header />
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <p className='text-slate-600 dark:text-slate-400 mb-4'>
              {language === 'zh' ? '请先登录' : 'Please login first'}
            </p>
            <Link
              href='/login'
              className='text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/80 dark:hover:bg-white/80 transition px-4 py-2 inline-block'
            >
              {t.user.login}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='flex max-w-7xl mx-auto flex-col items-center justify-center min-h-screen bg-[#F7F4E9] dark:bg-slate-900 transition-colors duration-300'>
      <Head>
        <title>{`${language === 'zh' ? '充值积分' : 'Recharge Credits'} - ${t.nav.studio}`}</title>
      </Head>
      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-start px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        <h1 className='mx-auto max-w-5xl font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-normal text-slate-900 dark:text-slate-100 mb-6 transition-colors duration-300'>
          {t.user.rechargeCredits}
        </h1>

        {/* 当前积分余额 */}
        <div className='w-full max-w-2xl mb-8'>
          <div className='bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border-2 border-[#E8DEBB] dark:border-slate-700 text-center'>
            <p className='text-sm text-slate-600 dark:text-slate-400 mb-2'>
              {t.user.creditsBalance}
            </p>
            <div className='text-4xl font-bold text-slate-900 dark:text-slate-100'>
              {credits !== null ? credits : 0}
            </div>
          </div>
        </div>

        {/* 积分套餐 */}
        <div className='w-full max-w-4xl'>
          <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 text-center'>
            {language === 'zh' ? '选择充值套餐' : 'Select Credit Package'}
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {creditPackages.map((pkg) => (
              <div
                key={pkg.amount}
                className='bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border-2 border-[#E8DEBB] dark:border-slate-700 hover:border-black dark:hover:border-white transition-colors flex flex-col'
              >
                <div className='text-center mb-4 flex-grow'>
                  <div className='text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1'>
                    {pkg.amount}
                  </div>
                  {pkg.bonus > 0 && (
                    <div className='text-sm text-green-600 dark:text-green-400 font-medium'>
                      +{pkg.bonus} {language === 'zh' ? '赠送' : 'Bonus'}
                    </div>
                  )}
                  <div className='text-lg font-semibold text-slate-700 dark:text-slate-300 mt-2'>
                    A${pkg.price}
                  </div>
                </div>
                <button
                  onClick={() => handlePurchase(pkg.amount + pkg.bonus, pkg.price, pkg.packageId)}
                  disabled={processing}
                  className='w-full bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/80 dark:hover:bg-white/80 transition px-4 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-auto'
                >
                  {processing ? t.user.processing : (language === 'zh' ? '立即充值' : 'Purchase')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 返回链接 */}
        <div className='mt-8'>
          <Link
            href='/profile'
            className='text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition'
          >
            {language === 'zh' ? '← 返回用户中心' : '← Back to Profile'}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Credits;

