import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabaseClient } from '../lib/supabaseClient';
import { useIsAuthenticated } from '../hooks/useAuth';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Login: NextPage = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useIsAuthenticated();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 使用 Supabase 客户端直接登录
      const { data, error: signInError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // 提供更友好的错误提示
        let errorMessage = signInError.message || '登录失败，请重试';
        
        // 处理常见的错误情况
        if (signInError.message?.includes('Invalid login credentials')) {
          errorMessage = '邮箱或密码错误，请检查后重试。如果刚注册，请先验证邮箱。';
        } else if (signInError.message?.includes('Email not confirmed')) {
          errorMessage = '请先验证您的邮箱。请检查收件箱中的验证邮件。';
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // 登录成功，Supabase 会自动保存 session
      // session 会通过 AuthContext 自动更新
      if (data.session) {
        // 重定向到首页或用户页面
        router.push('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('网络错误，请稍后重试');
      setLoading(false);
    }
  };

  // 如果正在检查认证状态，显示加载中
  if (authLoading) {
    return (
      <div className='flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen'>
        <div className='text-center'>加载中...</div>
      </div>
    );
  }

  return (
    <div className='flex max-w-7xl mx-auto flex-col items-center justify-center py-2 min-h-screen bg-[#F7F4E9] dark:bg-slate-900 transition-colors duration-300'>
      <Head>
        <title>登录 - 照片修复工具</title>
      </Head>
      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-center px-4 sm:px-6 lg:px-8 mt-20'>
        <div className='w-full max-w-md'>
          <h1 className='text-3xl font-bold text-center mb-8 text-slate-900'>
            登录账户
          </h1>
          
          <form onSubmit={handleSubmit} className='space-y-6'>
            {error && (
              <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
                {error}
              </div>
            )}

            <div>
              <label htmlFor='email' className='block text-sm font-medium text-slate-700 mb-2'>
                邮箱地址
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='w-full px-4 py-3 border-2 border-[#E8DEBB] rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition bg-white text-slate-700'
                placeholder='your@email.com'
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor='password' className='block text-sm font-medium text-slate-700 mb-2'>
                密码
              </label>
              <input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className='w-full px-4 py-3 border-2 border-[#E8DEBB] rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition bg-white text-slate-700'
                placeholder='请输入密码'
                disabled={loading}
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-[#3290EE] text-white font-medium px-4 py-3 rounded-lg hover:bg-[#3290EE]/80 transition disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-sm text-slate-600'>
              还没有账户？{' '}
              <Link href='/register' className='text-[#3290EE] hover:underline font-medium'>
                立即注册
              </Link>
            </p>
            <p className='text-sm text-slate-600 mt-2'>
              <Link href='/forgot-password' className='text-[#3290EE] hover:underline'>
                忘记密码？
              </Link>
            </p>
            <p className='text-sm text-slate-600 mt-2'>
              <Link href='/email-verification-guide' className='text-[#3290EE] hover:underline'>
                什么是邮箱验证？如何操作？
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;

