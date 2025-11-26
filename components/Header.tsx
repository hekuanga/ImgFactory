import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useBillingPortal } from '../hooks/useBillingPortal';
import { supabaseClient } from '../lib/supabaseClient';
import { useTranslation } from '../hooks/useTranslation';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

export default function Header() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { openPortal, loading: portalLoading } = useBillingPortal();
  const { t } = useTranslation();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const logoButtonRef = useRef<HTMLButtonElement>(null);
  const [rainbowHeight, setRainbowHeight] = useState(0);

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

  // 计算彩虹色条高度和位置 - 从页面顶部到Logo按钮顶部，稍微往下延伸
  useEffect(() => {
    const updateRainbowHeight = () => {
      if (logoButtonRef.current) {
        const rect = logoButtonRef.current.getBoundingClientRect();
        // 计算从页面顶部到按钮顶部的距离，并稍微往下延伸一点
        const buttonTop = rect.top;
        const extendAmount = 8; // 往下延伸8px
        const totalHeight = buttonTop + extendAmount;
        
        // 计算按钮的水平中心位置
        const buttonLeft = rect.left;
        const buttonWidth = rect.width;
        const buttonCenterX = buttonLeft + buttonWidth / 2;
        
        setRainbowHeight(totalHeight);
        // 存储按钮中心X位置，用于定位色条
        if (typeof window !== 'undefined') {
          document.documentElement.style.setProperty('--logo-button-center-x', `${buttonCenterX}px`);
        }
      }
    };

    // 初始计算
    updateRainbowHeight();
    
    // 延迟一下确保DOM已渲染
    const timeoutId = setTimeout(updateRainbowHeight, 100);
    const timeoutId2 = setTimeout(updateRainbowHeight, 300);
    
    window.addEventListener('resize', updateRainbowHeight);
    window.addEventListener('scroll', updateRainbowHeight);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
      window.removeEventListener('resize', updateRainbowHeight);
      window.removeEventListener('scroll', updateRainbowHeight);
    };
  }, []);

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

  const isActive = (path: string) => router.pathname === path;

  return (
    <header className='relative w-full bg-[#F7F4E9] dark:bg-slate-900 transition-colors duration-300'>
      {/* 垂直彩虹色条 - 从页面顶部到Logo按钮顶部（参考Group 1.svg） */}
      {rainbowHeight > 0 && (
        <div 
          className='fixed top-0 z-50 pointer-events-none w-8 sm:w-10 lg:w-12' 
          style={{ 
            left: 'var(--logo-button-center-x, 50%)',
            transform: 'translateX(-50%)',
            height: `${rainbowHeight}px`,
          }}
        >
          <div className='flex h-full shadow-lg rounded-b-lg overflow-hidden' style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.25)' }}>
            <div className='flex-1 bg-[#EB333D]'></div>
            <div className='flex-1 bg-[#F98F45]'></div>
            <div className='flex-1 bg-[#70B78B]'></div>
            <div className='flex-1 bg-[#4B8AD1]'></div>
          </div>
        </div>
      )}
        {/* 导航栏容器 */}
        <div className='flex justify-between items-center w-full pt-6 pb-5 sm:pt-8 sm:pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-wrap gap-3'>
          {/* 左侧导航按钮 */}
          <nav className='flex items-center gap-1.5 sm:gap-2 lg:gap-3 xl:gap-4 flex-1 justify-center sm:justify-start flex-wrap'>
            {/* 蓝星照相馆 Logo */}
            <Link href='/' className='relative block'>
              <button
                ref={logoButtonRef}
                className={`
                  relative px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3
                bg-gradient-to-b from-[#F7F4E9] to-[#FCF7E3] dark:from-slate-800 dark:to-slate-700 rounded-[24px] sm:rounded-[28px] lg:rounded-[32px]
                border-[3px] sm:border-[4px] border-[#CFC3A7] dark:border-slate-600
                text-slate-900 dark:text-slate-100 font-medium text-base sm:text-lg lg:text-xl
                  transition-all duration-200
                  hover:scale-105 hover:shadow-lg
                  flex items-center gap-2 sm:gap-3
                  before:absolute before:inset-0 before:rounded-[24px] sm:before:rounded-[28px] lg:before:rounded-[32px]
                  before:bg-gradient-to-br before:from-[#FFF8E0]/40 before:to-transparent
                  before:pointer-events-none
                  shadow-md
                `}
              >
                {/* 相机图标 */}
                <span className='relative z-10 flex items-center justify-center'>
                  <svg 
                    width='20' 
                    height='20' 
                    viewBox='0 0 24 24' 
                    fill='none' 
                    stroke='currentColor' 
                    strokeWidth='2.5' 
                    strokeLinecap='round' 
                    strokeLinejoin='round'
                    className='sm:w-6 sm:h-6 lg:w-7 lg:h-7'
                  >
                    <rect x='2' y='5' width='20' height='14' rx='2' ry='2' strokeWidth='2.5'/>
                    <circle cx='12' cy='12' r='3' strokeWidth='2.5'/>
                    <circle cx='18' cy='7' r='1.5' fill='currentColor'/>
                  </svg>
                </span>
                <span className='relative z-10 whitespace-nowrap'>{t.nav.studio}</span>
              </button>
            </Link>

          {/* 首页按钮 */}
          <Link href='/' className='relative block mx-1 sm:mx-2 lg:mx-3'>
            <button
              className={`
                relative px-3 sm:px-4 lg:px-5 xl:px-6 py-2 sm:py-2.5 lg:py-3
                bg-[#F7F4E9] dark:bg-slate-800 rounded-[20px] sm:rounded-[22px] lg:rounded-[24px]
                border-[3px] sm:border-[4px] border-[#CFC3A7] dark:border-slate-600
                text-slate-900 dark:text-slate-100 font-medium text-xs sm:text-sm lg:text-base
                transition-all duration-200
                hover:scale-105 hover:shadow-md
                ${isActive('/') ? 'opacity-100 shadow-sm' : 'opacity-90'}
                before:absolute before:inset-0 before:rounded-[20px] sm:before:rounded-[22px] lg:before:rounded-[24px]
                before:bg-gradient-to-br before:from-[#FFF8E0]/30 before:to-transparent
                before:pointer-events-none
                whitespace-nowrap
              `}
            >
              <span className='relative z-10'>{t.nav.home}</span>
            </button>
          </Link>

          {/* 照片修复按钮 */}
          <Link href='/restore' className='relative block'>
            <button
              className={`
                relative px-3 sm:px-4 lg:px-5 xl:px-6 py-2 sm:py-2.5 lg:py-3
                bg-[#F7F4E9] dark:bg-slate-800 rounded-[20px] sm:rounded-[22px] lg:rounded-[24px]
                border-[3px] sm:border-[4px] border-[#CFC3A7] dark:border-slate-600
                text-slate-900 dark:text-slate-100 font-medium text-xs sm:text-sm lg:text-base
                transition-all duration-200
                hover:scale-105 hover:shadow-md
                ${isActive('/restore') ? 'opacity-100 shadow-sm' : 'opacity-90'}
                before:absolute before:inset-0 before:rounded-[20px] sm:before:rounded-[22px] lg:before:rounded-[24px]
                before:bg-gradient-to-br before:from-[#FFF8E0]/30 before:to-transparent
                before:pointer-events-none
                whitespace-nowrap
              `}
            >
              <span className='relative z-10'>{t.nav.restore}</span>
            </button>
          </Link>

          {/* 生证件照按钮 */}
          <Link href='/passport-photo' className='relative block'>
            <button
              className={`
                relative px-3 sm:px-4 lg:px-5 xl:px-6 py-2 sm:py-2.5 lg:py-3
                bg-[#F7F4E9] dark:bg-slate-800 rounded-[20px] sm:rounded-[22px] lg:rounded-[24px]
                border-[3px] sm:border-[4px] border-[#CFC3A7] dark:border-slate-600
                text-slate-900 dark:text-slate-100 font-medium text-xs sm:text-sm lg:text-base
                transition-all duration-200
                hover:scale-105 hover:shadow-md
                ${isActive('/passport-photo') ? 'opacity-100 shadow-sm' : 'opacity-90'}
                before:absolute before:inset-0 before:rounded-[20px] sm:before:rounded-[22px] lg:before:rounded-[24px]
                before:bg-gradient-to-br before:from-[#FFF8E0]/30 before:to-transparent
                before:pointer-events-none
                whitespace-nowrap
              `}
            >
              <span className='relative z-10'>{t.nav.passportPhoto}</span>
            </button>
          </Link>
        </nav>

        {/* 用户操作区域 - 右侧 */}
        <div className='flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0 flex-wrap justify-end'>
          {/* 语言和主题切换按钮 */}
          <LanguageToggle />
          <ThemeToggle />
          
          {loading ? (
            <div className='text-xs sm:text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap'>{t.user.loading}</div>
          ) : user ? (
            <>
              {/* 邮箱地址 - 完全融入背景 */}
              <div className='text-xs sm:text-sm text-slate-700 dark:text-slate-300 hidden xl:block whitespace-nowrap max-w-[200px] sm:max-w-[240px] truncate'>
                {user.email}
              </div>
              {isSubscribed && (
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading || checkingSubscription}
                  className='text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap'
                >
                  {portalLoading ? t.user.processing : t.user.manageSubscription}
                </button>
              )}
              <Link
                href='/billing'
                className='text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition whitespace-nowrap'
              >
                {t.user.subscribe}
              </Link>
              <button
                onClick={handleSignOut}
                className='text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition whitespace-nowrap'
              >
                {t.user.logout}
              </button>
            </>
          ) : (
            <>
              <Link
                href='/login'
                className='text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition whitespace-nowrap'
              >
                {t.user.login}
              </Link>
              <Link
                href='/register'
                className='text-xs font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/80 dark:hover:bg-white/80 transition whitespace-nowrap shadow-md px-2.5 sm:px-3 py-1.5'
              >
                {t.user.register}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
