import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabaseClient } from '../lib/supabaseClient';
import { useIsAuthenticated } from '../hooks/useAuth';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Register: NextPage = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useIsAuthenticated();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/').catch(() => {
        // 忽略路由错误，避免无限循环
      });
    }
  }, [isAuthenticated, authLoading]); // 移除 router 依赖，避免无限循环

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // 客户端验证
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为 6 个字符');
      return;
    }

    setLoading(true);

    try {
      // 检查 Supabase 配置
      // 注意：在客户端，process.env.NEXT_PUBLIC_* 变量在构建时注入
      // 如果部署后仍然有问题，检查 Vercel 环境变量配置
      if (!supabaseClient || !supabaseClient.auth) {
        console.error('Supabase client not initialized');
        setError('服务配置错误，请稍后重试或联系管理员');
        setLoading(false);
        return;
      }
      
      // 调试信息（仅在开发环境）
      if (process.env.NODE_ENV === 'development') {
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      }

      // 调用注册 API 路由（这样会执行积分赠送逻辑）
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          metadata: name ? { name } : {},
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok || !registerData.success) {
        let errorMessage = registerData.error || '注册失败，请重试';
        
        // 处理网络错误
        if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('NetworkError')) {
          errorMessage = '网络连接失败，请检查网络连接后重试。如果问题持续，可能是服务器配置问题，请联系管理员。';
        }
        
        console.error('Register error:', registerData);
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // 注册成功
      if (registerData.session) {
        // 使用返回的 session 设置 Supabase 客户端
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.setSession({
          access_token: registerData.session.access_token,
          refresh_token: registerData.session.refresh_token,
        });

        if (sessionError) {
          console.error('Failed to set session:', sessionError);
          setError('登录失败，请重试');
          setLoading(false);
          return;
        }

        // 登录成功，重定向到首页
        router.push('/');
      } else if (registerData.user) {
        // 用户已创建，但需要邮箱验证
        // 显示明显的验证提示
        setError('');
        setRegisteredEmail(email);
        setShowVerificationNotice(true);
        setLoading(false);
        // 滚动到顶部显示提示
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError('注册失败，请重试');
        setLoading(false);
      }
    } catch (err) {
      console.error('Register error:', err);
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      
      // 检查是否是网络错误
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('NetworkError')) {
        setError('网络连接失败，请检查网络连接后重试。如果问题持续，请联系管理员。');
      } else {
        setError('注册失败，请稍后重试');
      }
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
        <title>注册 - 照片修复工具</title>
      </Head>
      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-center px-4 sm:px-6 lg:px-8 mt-20'>
        <div className='w-full max-w-md'>
          <h1 className='text-3xl font-bold text-center mb-8 text-slate-900'>
            创建账户
          </h1>

          {/* 邮箱验证提示 */}
          {showVerificationNotice && (
            <div className='mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 shadow-lg'>
              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  <svg className='h-8 w-8 text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                  </svg>
                </div>
                <div className='ml-4 flex-1'>
                  <h3 className='text-xl font-bold text-blue-900 mb-2'>
                    ✓ 注册成功！请验证您的邮箱
                  </h3>
                  <p className='text-blue-800 mb-4'>
                    我们已向 <strong className='font-semibold'>{registeredEmail}</strong> 发送了一封验证邮件。
                  </p>
                  
                  <div className='bg-white rounded-lg p-4 mb-4 border border-blue-200'>
                    <p className='text-sm font-semibold text-slate-900 mb-2'>📧 验证步骤：</p>
                    <ol className='list-decimal list-inside space-y-1 text-sm text-slate-700'>
                      <li>打开您的邮箱收件箱</li>
                      <li>查找来自我们的验证邮件（可能在垃圾邮件文件夹）</li>
                      <li>点击邮件中的"验证邮箱"按钮或链接</li>
                      <li>验证成功后即可登录</li>
                    </ol>
                  </div>

                  <div className='bg-yellow-50 border border-yellow-200 rounded p-3 mb-4'>
                    <p className='text-sm text-yellow-800'>
                      <strong>💡 提示：</strong> 如果没收到邮件，请检查垃圾邮件文件夹，或等待几分钟后重试。
                    </p>
                  </div>

                  <div className='flex flex-col sm:flex-row gap-3'>
                    <Link
                      href='/email-verification-guide'
                      className='flex-1 bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center'
                    >
                      查看详细指南
                    </Link>
                    <button
                      onClick={() => {
                        setShowVerificationNotice(false);
                        router.push('/login');
                      }}
                      className='flex-1 border border-blue-300 text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition'
                    >
                      前往登录页面
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className='space-y-6'>
            {error && (
              <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
                {error}
              </div>
            )}

            <div>
              <label htmlFor='name' className='block text-sm font-medium text-slate-700 mb-2'>
                姓名（可选）
              </label>
              <input
                id='name'
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full px-4 py-3 border-2 border-[#E8DEBB] rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition bg-white text-slate-700'
                placeholder='您的姓名'
                disabled={loading}
              />
            </div>

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
                placeholder='至少 6 个字符'
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor='confirmPassword' className='block text-sm font-medium text-slate-700 mb-2'>
                确认密码
              </label>
              <input
                id='confirmPassword'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className='w-full px-4 py-3 border-2 border-[#E8DEBB] rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition bg-white text-slate-700'
                placeholder='请再次输入密码'
                disabled={loading}
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-[#3290EE] text-white font-medium px-4 py-3 rounded-lg hover:bg-[#3290EE]/80 transition disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <div className='mt-6 text-center space-y-2'>
            <p className='text-sm text-slate-600'>
              已有账户？{' '}
              <Link href='/login' className='text-[#3290EE] hover:underline font-medium'>
                立即登录
              </Link>
            </p>
            <p className='text-sm text-slate-600'>
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

export default Register;

