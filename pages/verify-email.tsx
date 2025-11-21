import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabaseClient } from '../lib/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';

const VerifyEmail: NextPage = () => {
  const router = useRouter();
  const { token_hash, type, access_token, refresh_token } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // 方法1: 如果 URL 中有 token_hash（OTP 验证）
        if (token_hash && type === 'email') {
          const { data, error } = await supabaseClient.auth.verifyOtp({
            token_hash: token_hash as string,
            type: 'email',
          });

          if (error) {
            setStatus('error');
            setMessage(error.message || '邮箱验证失败');
            return;
          }

          // 验证成功，检查是否有 session
          if (data.session) {
            setStatus('success');
            setMessage('邮箱验证成功！正在自动登录...');
            // 等待 session 更新后跳转
            setTimeout(() => {
              router.push('/');
            }, 2000);
          } else {
            setStatus('success');
            setMessage('邮箱验证成功！请前往登录页面登录。');
            setTimeout(() => {
              router.push('/login');
            }, 3000);
          }
          return;
        }

        // 方法2: 如果 URL 中有 access_token（直接验证链接）
        if (access_token && refresh_token) {
          // Supabase 会自动处理 URL 中的 token（因为 detectSessionInUrl: true）
          // 等待一下让 Supabase 处理
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 检查 session 是否已设置
          const { data: { session }, error } = await supabaseClient.auth.getSession();
          
          if (error) {
            setStatus('error');
            setMessage(error.message || '邮箱验证失败');
            return;
          }

          if (session) {
            setStatus('success');
            setMessage('邮箱验证成功！正在自动登录...');
            setTimeout(() => {
              router.push('/');
            }, 2000);
          } else {
            setStatus('error');
            setMessage('验证链接无效或已过期，请重新注册。');
          }
          return;
        }

        // 方法3: 检查是否已有 session（可能已经通过 URL 自动验证）
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (session) {
          setStatus('success');
          setMessage('邮箱验证成功！您已自动登录。');
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('未找到验证信息。请检查验证链接是否正确，或重新注册。');
        }
      } catch (err) {
        console.error('Verify email error:', err);
        setStatus('error');
        setMessage('验证过程中发生错误，请重试');
      }
    };

    verifyEmail();
  }, [token_hash, type, access_token, refresh_token, router]);

  return (
    <div className='flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen'>
      <Head>
        <title>邮箱验证 - 照片修复工具</title>
      </Head>
      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-center px-4 mt-20'>
        <div className='w-full max-w-md'>
          <h1 className='text-3xl font-bold text-center mb-8 text-slate-900'>
            邮箱验证
          </h1>

          {status === 'loading' && (
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 text-center'>
              <div className='text-blue-600 mb-2'>正在验证邮箱...</div>
            </div>
          )}

          {status === 'success' && (
            <div className='bg-green-50 border border-green-200 rounded-lg p-6 text-center'>
              <div className='text-green-600 mb-4 font-semibold'>{message}</div>
              <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                <Link
                  href='/'
                  className='inline-block bg-[#3290EE] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#3290EE]/80 transition'
                >
                  前往首页
                </Link>
                <Link
                  href='/login'
                  className='inline-block border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition'
                >
                  前往登录
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
              <div className='text-red-600 mb-4'>{message}</div>
              <div className='space-y-2'>
                <Link
                  href='/login'
                  className='inline-block bg-[#3290EE] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#3290EE]/80 transition mr-2'
                >
                  返回登录
                </Link>
                <Link
                  href='/register'
                  className='inline-block border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition'
                >
                  重新注册
                </Link>
              </div>
            </div>
          )}

          {/* 说明信息 */}
          <div className='mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6'>
            <h2 className='text-lg font-semibold mb-3 text-slate-900'>什么是邮箱验证？</h2>
            <div className='text-sm text-slate-600 space-y-2'>
              <p>
                邮箱验证是为了确保您提供的邮箱地址是真实有效的。注册后，我们会向您的邮箱发送一封验证邮件。
              </p>
              <p className='font-medium text-slate-700'>验证步骤：</p>
              <ol className='list-decimal list-inside space-y-1 ml-2'>
                <li>注册账户后，检查您的邮箱收件箱</li>
                <li>找到来自我们的验证邮件（可能在垃圾邮件文件夹）</li>
                <li>点击邮件中的验证链接</li>
                <li>验证成功后即可登录</li>
              </ol>
            </div>
          </div>

          {/* 没有收到邮件 */}
          <div className='mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-6'>
            <h3 className='text-md font-semibold mb-2 text-yellow-900'>没有收到验证邮件？</h3>
            <div className='text-sm text-yellow-800 space-y-2'>
              <p>• 检查垃圾邮件文件夹</p>
              <p>• 确认邮箱地址是否正确</p>
              <p>• 等待几分钟后重试</p>
              <p>• 如果仍然没有收到，请联系客服</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyEmail;

