import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../components/Footer';
import Header from '../components/Header';
import SquigglyLines from '../components/SquigglyLines';
import { useTranslation } from '../hooks/useTranslation';

const Home: NextPage = () => {
  const { t } = useTranslation();
  
  return (
    <div className='flex max-w-7xl mx-auto flex-col items-center justify-center min-h-screen bg-[#F7F4E9] dark:bg-slate-900 transition-colors duration-300'>
      <Head>
        <title>{t.home.title} - {t.nav.studio}</title>
      </Head>
      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        {/* 主标题区域 */}
        <div className='text-center mb-6 sm:mb-8 lg:mb-10 w-full'>
          <h1 className='mx-auto max-w-5xl font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-normal text-slate-900 dark:text-slate-100 mb-2 transition-colors duration-300 leading-tight relative'>
            {t.home.title}
            <SquigglyLines />
          </h1>
          <p className='mx-auto max-w-3xl text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 transition-colors duration-300 px-4'>
            {t.home.subtitle}
          </p>
        </div>

        {/* 照片对比容器 - 显示示例图片 */}
        <div className='w-full max-w-5xl mb-6 sm:mb-8'>
          <div className='bg-[#F7F4E9] dark:bg-slate-800 rounded-3xl sm:rounded-[40px] p-4 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border-4 border-[#E8DEBB] dark:border-slate-700 relative overflow-hidden transition-colors duration-300'>
            {/* 内部装饰效果 */}
            <div className='absolute inset-0 opacity-30 pointer-events-none'>
              <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FFF8E0] to-transparent'></div>
            </div>
            
            <div className='relative flex flex-col sm:flex-row gap-4 sm:gap-8'>
              {/* 修复前示例 */}
              <div className='flex-1'>
                <h2 className='mb-3 sm:mb-4 font-medium text-base sm:text-lg text-slate-700 dark:text-slate-300 text-center sm:text-left transition-colors duration-300'>{t.restore.originalPhoto}</h2>
                <div className='bg-white dark:bg-slate-700 rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-inner border-2 border-[#E8DEBB] dark:border-slate-600 overflow-hidden transition-colors duration-300'>
                  <div className='relative w-full aspect-[3/4]'>
                    <Image
                      alt='修复前示例'
                      src='/old.png'
                      className='w-full h-full object-contain rounded-xl'
                      fill
                      sizes='(max-width: 640px) 100vw, 50vw'
                    />
                  </div>
                </div>
              </div>

              {/* 分隔线 */}
              <div className='hidden sm:block w-px bg-[#CFC3A7] dark:bg-slate-600 self-stretch my-4 transition-colors duration-300'></div>
              <div className='sm:hidden w-full h-px bg-[#CFC3A7] dark:bg-slate-600 my-2 transition-colors duration-300'></div>

              {/* 修复后示例 */}
              <div className='flex-1'>
                <h2 className='mb-3 sm:mb-4 font-medium text-base sm:text-lg text-slate-700 dark:text-slate-300 text-center sm:text-left transition-colors duration-300'>{t.restore.restoredPhoto}</h2>
                <div className='bg-white dark:bg-slate-700 rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-inner border-2 border-[#E8DEBB] dark:border-slate-600 overflow-hidden transition-colors duration-300'>
                  <div className='relative w-full aspect-[3/4]'>
                    <Image
                      alt='修复后示例'
                      src='/new.jpeg'
                      className='w-full h-full object-contain rounded-xl'
                      fill
                      sizes='(max-width: 640px) 100vw, 50vw'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 功能按钮组 */}
        <div className='mb-8 sm:mb-10 lg:mb-12 w-full max-w-4xl'>
          <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 items-center justify-center'>
            {/* 修复照片按钮 */}
            <Link href='/restore' className='relative inline-block transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto'>
              <button
                className={`
                  relative w-full sm:w-auto px-8 sm:px-12 lg:px-16 py-3 sm:py-4 lg:py-5
                  bg-[#F7F4E9] dark:bg-slate-800 rounded-[32px] sm:rounded-[36px] lg:rounded-[40px]
                  border-[6px] sm:border-[7px] lg:border-[8px] border-[#E8DEBB] dark:border-slate-600
                  text-slate-900 dark:text-slate-100 font-medium text-lg sm:text-xl lg:text-2xl transition-colors duration-300
                  transition-all duration-200
                  hover:shadow-lg hover:scale-105
                  before:absolute before:inset-0 before:rounded-[32px] sm:before:rounded-[36px] lg:before:rounded-[40px]
                  before:bg-gradient-to-br before:from-[#FFF8E0]/40 before:via-[#FFF8E0]/20 before:to-transparent
                  before:pointer-events-none
                  shadow-md
                `}
              >
                <span className='relative z-10 whitespace-nowrap'>{t.home.restoreButton}</span>
              </button>
            </Link>

            {/* 生成证件照按钮 */}
            <Link href='/passport-photo' className='relative inline-block transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto'>
              <button
                className={`
                  relative w-full sm:w-auto px-8 sm:px-12 lg:px-16 py-3 sm:py-4 lg:py-5
                  bg-[#F7F4E9] dark:bg-slate-800 rounded-[32px] sm:rounded-[36px] lg:rounded-[40px]
                  border-[6px] sm:border-[7px] lg:border-[8px] border-[#E8DEBB] dark:border-slate-600
                  text-slate-900 dark:text-slate-100 font-medium text-lg sm:text-xl lg:text-2xl transition-colors duration-300
                  transition-all duration-200
                  hover:shadow-lg hover:scale-105
                  before:absolute before:inset-0 before:rounded-[32px] sm:before:rounded-[36px] lg:before:rounded-[40px]
                  before:bg-gradient-to-br before:from-[#FFF8E0]/40 before:via-[#FFF8E0]/20 before:to-transparent
                  before:pointer-events-none
                  shadow-md
                `}
              >
                <span className='relative z-10 whitespace-nowrap'>{t.home.passportPhotoButton}</span>
              </button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
