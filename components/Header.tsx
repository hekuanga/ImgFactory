import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useBillingPortal } from '../hooks/useBillingPortal';
import { supabaseClient } from '../lib/supabaseClient';

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const { openPortal, loading: portalLoading } = useBillingPortal();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  // 检查用户订阅状态
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setIsSubscribed(false);
        return;
      }

      setCheckingSubscription(true);
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
          setIsSubscribed(false);
          return;
        }

        const response = await fetch('/api/billing/status', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        const data = await response.json();
        if (data.success && data.subscription) {
          setIsSubscribed(data.subscription.isSubscribed || false);
        }
      } catch (error) {
        console.error('Check subscription error:', error);
      } finally {
        setCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleManageSubscription = async () => {
    await openPortal();
  };

  return (
    <header className='flex justify-between items-center w-full mt-5 border-b-2 pb-7 sm:px-4 px-2'>
      <Link href='/' className='flex space-x-2'>
        <img
          alt='header text'
          src='/imageIcon.png'
          className='sm:w-10 sm:h-10 w-7 h-7'
          width={20}
          height={20}
        />
        <h1 className='sm:text-3xl text-xl font-bold ml-2 tracking-tight'>
          照片修复工具
        </h1>
      </Link>
      <div className='flex space-x-6 items-center'>
        <Link
          href='/'
          className='border-r border-gray-300 pr-4 space-x-2 hover:text-blue-400 transition hidden sm:flex'
        >
          <p className='font-medium text-base'>首页</p>
        </Link>
        <Link
          href='/restore'
          className='border-r border-gray-300 pr-4 space-x-2 hover:text-blue-400 transition hidden sm:flex'
        >
          <p className='font-medium text-base'>修复</p>
        </Link>
        <Link
          href='/passport-photo'
          className='border-r border-gray-300 pr-4 space-x-2 hover:text-blue-400 transition hidden sm:flex'
        >
          <p className='font-medium text-base'>证件照</p>
        </Link>
        
        {loading ? (
          <div className='px-4 py-2 text-sm text-slate-500'>加载中...</div>
        ) : user ? (
          <>
            <div className='px-4 py-2 text-sm text-slate-700 hidden sm:block'>
              {user.email}
            </div>
            {isSubscribed && (
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading || checkingSubscription}
                className='px-4 py-2 text-sm font-medium text-slate-700 hover:text-[#3290EE] transition disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {portalLoading ? '处理中...' : '管理订阅'}
              </button>
            )}
            <Link
              href='/billing'
              className='px-4 py-2 text-sm font-medium text-slate-700 hover:text-[#3290EE] transition'
            >
              订阅
            </Link>
            <button
              onClick={handleSignOut}
              className='px-4 py-2 text-sm font-medium text-slate-700 hover:text-[#3290EE] transition'
            >
              登出
            </button>
          </>
        ) : (
          <>
            <Link
              href='/login'
              className='px-4 py-2 text-sm font-medium text-slate-700 hover:text-[#3290EE] transition'
            >
              登录
            </Link>
            <Link
              href='/register'
              className='px-4 py-2 text-sm font-medium bg-[#3290EE] text-white rounded-lg hover:bg-[#3290EE]/80 transition'
            >
              注册
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
