import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';

const NotFound: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    // 如果是客户端路由，尝试重定向到首页
    // 这可以处理一些边缘情况
    const timer = setTimeout(() => {
      // 不自动重定向，让用户手动选择
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <title>404 - 页面未找到</title>
        <meta name="description" content="抱歉，您访问的页面不存在" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-md">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              页面未找到
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              抱歉，您访问的页面不存在或已被移动。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="px-6 py-3 bg-[#3290EE] text-white rounded-lg hover:bg-[#2a7bc8] transition-colors font-medium"
              >
                返回首页
              </Link>
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                返回上一页
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default NotFound;

