import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { supabaseClient } from '../lib/supabaseClient';
import { useTranslation } from '../hooks/useTranslation';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

export default function Header() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { t } = useTranslation();
  const logoButtonRef = useRef<HTMLButtonElement>(null);
  const [rainbowHeight, setRainbowHeight] = useState(0);
  const [credits, setCredits] = useState<number | null>(null);
  const [showCreditsMenu, setShowCreditsMenu] = useState(false);
  const creditsMenuRef = useRef<HTMLDivElement>(null);

  // 检查用户积分
  useEffect(() => {
    const loadCredits = async () => {
      if (!user) {
        setCredits(null);
        return;
      }

      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
          setCredits(null);
          return;
        }

        const creditsResponse = await fetch('/api/credits/balance', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        const creditsData = await creditsResponse.json();
        if (creditsData.success && creditsData.credits !== undefined) {
          setCredits(creditsData.credits);
        }
      } catch (error) {
        console.error('Load credits error:', error);
      }
    };

    loadCredits();
  }, [user]);

  // 点击外部关闭积分菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (creditsMenuRef.current && !creditsMenuRef.current.contains(event.target as Node)) {
        setShowCreditsMenu(false);
      }
    };

    if (showCreditsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCreditsMenu]);

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
                  relative px-3 sm:px-4 lg:px-6 xl:px-8 py-2 sm:py-2.5 lg:py-3
                bg-gradient-to-b from-[#F7F4E9] to-[#FCF7E3] dark:from-slate-800 dark:to-slate-700 rounded-[24px] sm:rounded-[28px] lg:rounded-[32px]
                border-[3px] sm:border-[4px] border-[#CFC3A7] dark:border-slate-600
                text-slate-900 dark:text-slate-100 font-medium text-sm sm:text-base lg:text-lg xl:text-xl
                  transition-all duration-200
                  hover:scale-105 hover:shadow-lg
                  flex items-center gap-1.5 sm:gap-2 lg:gap-3
                  before:absolute before:inset-0 before:rounded-[24px] sm:before:rounded-[28px] lg:before:rounded-[32px]
                  before:bg-gradient-to-br before:from-[#FFF8E0]/40 before:to-transparent
                  before:pointer-events-none
                  shadow-md
                  whitespace-nowrap
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
        <div className='flex items-center gap-2 sm:gap-2.5 lg:gap-3 flex-shrink-0 flex-wrap justify-end'>
          {/* 语言和主题切换按钮 */}
          <LanguageToggle />
          <ThemeToggle />
          
          {loading ? (
            <div className='text-xs sm:text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap px-2'>{t.user.loading}</div>
          ) : user ? (
            <>
              {/* 积分显示 - 点击或悬停显示详情 */}
              <div className='relative' ref={creditsMenuRef}>
                <button
                  onClick={() => setShowCreditsMenu(!showCreditsMenu)}
                  onMouseEnter={() => setShowCreditsMenu(true)}
                  className='text-xs sm:text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition whitespace-nowrap flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                >
                  <svg className='w-4 h-4 sm:w-4.5 sm:h-4.5 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  <span className='font-medium'>{credits !== null ? credits : '...'}</span>
                </button>
                
                {/* 积分详情菜单 */}
                {showCreditsMenu && (
                  <div className='absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4 z-50'>
                    <div className='flex items-center justify-between mb-3'>
                      <h3 className='text-sm font-semibold text-slate-900 dark:text-slate-100'>{t.user.creditsBalance}</h3>
                      <button
                        onClick={() => setShowCreditsMenu(false)}
                        className='text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                      </button>
                    </div>
                    <div className='text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2'>
                      {credits !== null ? credits : 0}
                    </div>
                    <p className='text-xs text-slate-600 dark:text-slate-400 mb-4'>
                      {t.user.creditsDescription}
                    </p>
                    <div className='flex gap-2'>
                      <Link
                        href='/credits'
                        className='flex-1 text-center text-xs font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/80 dark:hover:bg-white/80 transition px-3 py-2'
                        onClick={() => setShowCreditsMenu(false)}
                      >
                        {t.user.rechargeCredits}
                      </Link>
                      <Link
                        href='/profile'
                        className='flex-1 text-center text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition px-3 py-2'
                        onClick={() => setShowCreditsMenu(false)}
                      >
                        {t.user.viewDetails}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 邮箱地址 - 响应式显示 */}
              <div className='text-xs sm:text-sm text-slate-700 dark:text-slate-300 hidden lg:block whitespace-nowrap max-w-[180px] xl:max-w-[220px] truncate px-2'>
                {user.email}
              </div>
              
              {/* 登出按钮 */}
              <button
                onClick={handleSignOut}
                className='text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition whitespace-nowrap px-2 sm:px-2.5 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800'
              >
                {t.user.logout}
              </button>
            </>
          ) : (
            <>
              <Link
                href='/login'
                className='text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition whitespace-nowrap px-2.5 sm:px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800'
              >
                {t.user.login}
              </Link>
              <Link
                href='/register'
                className='text-xs sm:text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/80 dark:hover:bg-white/80 transition whitespace-nowrap shadow-md px-3 sm:px-4 py-1.5 sm:py-2'
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
