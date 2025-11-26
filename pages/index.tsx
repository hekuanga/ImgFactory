import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../components/Footer';
import Header from '../components/Header';

const Home: NextPage = () => {
  return (
    <div className='flex max-w-7xl mx-auto flex-col items-center justify-center min-h-screen bg-[#F7F4E9]'>
      <Head>
        <title>用AI修复你的旧照片 - 蓝星照相馆</title>
      </Head>
      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        {/* 主标题区域 */}
        <div className='text-center mb-6 sm:mb-8 lg:mb-10 w-full'>
          <h1 className='mx-auto max-w-4xl font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-normal text-slate-900 mb-2'>
            用AI修复你的旧照片
          </h1>
          <p className='mx-auto text-sm sm:text-base lg:text-lg text-slate-600'>
            PHOTO RESTORATION
          </p>
        </div>

        {/* 照片对比容器 - 显示示例图片 */}
        <div className='w-full max-w-5xl mb-6 sm:mb-8'>
          <div className='bg-[#F7F4E9] rounded-3xl sm:rounded-[40px] p-4 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-4 border-[#E8DEBB] relative overflow-hidden'>
            {/* 内部装饰效果 */}
            <div className='absolute inset-0 opacity-30 pointer-events-none'>
              <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FFF8E0] to-transparent'></div>
            </div>
            
            <div className='relative flex flex-col sm:flex-row gap-4 sm:gap-8'>
              {/* 修复前示例 */}
              <div className='flex-1'>
                <h2 className='mb-3 sm:mb-4 font-medium text-base sm:text-lg text-slate-700 text-center sm:text-left'>修复前</h2>
                <div className='bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-inner border-2 border-[#E8DEBB] overflow-hidden'>
                  <div className='relative w-full aspect-square'>
                    <Image
                      alt='修复前示例'
                      src='/michael.jpg'
                      className='w-full h-full object-cover rounded-xl'
                      fill
                      sizes='(max-width: 640px) 100vw, 50vw'
                    />
                  </div>
                </div>
              </div>

              {/* 分隔线 */}
              <div className='hidden sm:block w-px bg-[#CFC3A7] self-stretch my-4'></div>
              <div className='sm:hidden w-full h-px bg-[#CFC3A7] my-2'></div>

              {/* 修复后示例 */}
              <div className='flex-1'>
                <h2 className='mb-3 sm:mb-4 font-medium text-base sm:text-lg text-slate-700 text-center sm:text-left'>修复后</h2>
                <div className='bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-inner border-2 border-[#E8DEBB] overflow-hidden'>
                  <div className='relative w-full aspect-square'>
                    <Image
                      alt='修复后示例'
                      src='/michael-new.jpg'
                      className='w-full h-full object-cover rounded-xl'
                      fill
                      sizes='(max-width: 640px) 100vw, 50vw'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 修复按钮 */}
        <div className='mb-8 sm:mb-10 lg:mb-12'>
          <Link href='/restore' className='relative inline-block transition-transform hover:scale-105 active:scale-95'>
            <button
              className={`
                relative px-8 sm:px-12 lg:px-16 py-3 sm:py-4 lg:py-5
                bg-[#F7F4E9] rounded-[32px] sm:rounded-[36px] lg:rounded-[40px]
                border-[6px] sm:border-[7px] lg:border-[8px] border-[#E8DEBB]
                text-slate-900 font-medium text-lg sm:text-xl lg:text-2xl
                transition-all duration-200
                hover:shadow-lg hover:scale-105
                before:absolute before:inset-0 before:rounded-[32px] sm:before:rounded-[36px] lg:before:rounded-[40px]
                before:bg-gradient-to-br before:from-[#FFF8E0]/40 before:via-[#FFF8E0]/20 before:to-transparent
                before:pointer-events-none
                shadow-md
              `}
            >
              <span className='relative z-10 whitespace-nowrap'>修复您的照片</span>
            </button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
