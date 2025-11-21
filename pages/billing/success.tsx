import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const BillingSuccess: NextPage = () => {
  const router = useRouter();
  const { session_id } = router.query;
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    // 如果有 session_id，可以在这里验证订阅状态
    // 注意：实际验证应该在服务端进行，这里只是展示
    if (session_id) {
      setLoading(false);
      // TODO: 可选 - 调用 API 验证 session 状态
      // fetch(`/api/billing/verify-session?session_id=${session_id}`)
      //   .then(res => res.json())
      //   .then(data => setSessionData(data));
    } else {
      setLoading(false);
    }
  }, [session_id]);

  return (
    <div className='flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen'>
      <Head>
        <title>订阅成功 - 照片修复工具</title>
      </Head>
      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-center px-4 mt-20'>
        <div className='w-full max-w-md'>
          {loading ? (
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#3290EE] mx-auto mb-4'></div>
              <p className='text-slate-600'>正在验证订阅...</p>
            </div>
          ) : (
            <>
              <div className='bg-green-50 border-2 border-green-300 rounded-lg p-8 text-center mb-6'>
                <div className='flex justify-center mb-4'>
                  <svg
                    className='h-16 w-16 text-green-600'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <h1 className='text-3xl font-bold text-green-900 mb-4'>
                  订阅成功！
                </h1>
                <p className='text-green-800 mb-2'>
                  感谢您的订阅，您的账户已成功升级。
                </p>
                {session_id && (
                  <p className='text-sm text-green-700 mt-4'>
                    订单号: {session_id}
                  </p>
                )}
              </div>

              <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6'>
                <h2 className='text-lg font-semibold text-blue-900 mb-3'>
                  接下来您可以：
                </h2>
                <ul className='space-y-2 text-sm text-blue-800'>
                  <li className='flex items-start'>
                    <span className='mr-2'>✓</span>
                    <span>立即开始使用所有高级功能</span>
                  </li>
                  <li className='flex items-start'>
                    <span className='mr-2'>✓</span>
                    <span>享受无限制的照片修复服务</span>
                  </li>
                  <li className='flex items-start'>
                    <span className='mr-2'>✓</span>
                    <span>访问专属客户支持</span>
                  </li>
                </ul>
              </div>

              <div className='space-y-3'>
                <Link
                  href='/'
                  className='block w-full bg-[#3290EE] text-white font-medium px-4 py-3 rounded-lg hover:bg-[#3290EE]/80 transition text-center'
                >
                  开始使用
                </Link>
                <Link
                  href='/billing'
                  className='block w-full border border-gray-300 text-gray-700 font-medium px-4 py-3 rounded-lg hover:bg-gray-50 transition text-center'
                >
                  管理订阅
                </Link>
              </div>

              <div className='mt-6 text-center'>
                <p className='text-sm text-slate-600'>
                  如有任何问题，请{' '}
                  <Link href='/contact' className='text-[#3290EE] hover:underline'>
                    联系客服
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BillingSuccess;


