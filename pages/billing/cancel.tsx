import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const BillingCancel: NextPage = () => {
  return (
    <div className='flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen'>
      <Head>
        <title>取消订阅 - 照片修复工具</title>
      </Head>
      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-center px-4 mt-20'>
        <div className='w-full max-w-md'>
          <div className='bg-yellow-50 border-2 border-yellow-300 rounded-lg p-8 text-center mb-6'>
            <div className='flex justify-center mb-4'>
              <svg
                className='h-16 w-16 text-yellow-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                />
              </svg>
            </div>
            <h1 className='text-3xl font-bold text-yellow-900 mb-4'>
              订阅已取消
            </h1>
            <p className='text-yellow-800 mb-2'>
              您已取消订阅流程。您的账户状态未发生变化。
            </p>
          </div>

          <div className='bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-3'>
              为什么选择订阅？
            </h2>
            <ul className='space-y-2 text-sm text-gray-700'>
              <li className='flex items-start'>
                <span className='mr-2'>✨</span>
                <span>无限制的照片修复次数</span>
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>🚀</span>
                <span>更快的处理速度</span>
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>💎</span>
                <span>高质量输出选项</span>
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>🎯</span>
                <span>优先客户支持</span>
              </li>
            </ul>
          </div>

          <div className='space-y-3'>
            <Link
              href='/billing'
              className='block w-full bg-[#3290EE] text-white font-medium px-4 py-3 rounded-lg hover:bg-[#3290EE]/80 transition text-center'
            >
              重新选择订阅计划
            </Link>
            <Link
              href='/'
              className='block w-full border border-gray-300 text-gray-700 font-medium px-4 py-3 rounded-lg hover:bg-gray-50 transition text-center'
            >
              返回首页
            </Link>
          </div>

          <div className='mt-6 text-center'>
            <p className='text-sm text-slate-600'>
              需要帮助？{' '}
              <Link href='/contact' className='text-[#3290EE] hover:underline'>
                联系客服
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BillingCancel;


