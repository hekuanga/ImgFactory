import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabaseClient } from '../../lib/supabaseClient';
import Head from 'next/head';

/**
 * Supabase Auth 回调页面
 * 处理邮箱验证、OAuth 回调等
 * Supabase 会自动从 URL hash 中提取 token 并设置 session
 */
export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('正在验证...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase 会自动从 URL hash (#access_token=...) 中提取 token 并设置 session
        // 因为 detectSessionInUrl: true
        
        // 等待 Supabase 处理 URL 中的 token（需要一些时间）
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 检查 session
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage(`验证失败：${error.message}`);
          setTimeout(() => {
            router.push('/login?error=verification_failed');
          }, 3000);
          return;
        }

        if (session && session.user) {
          // 验证成功，已自动登录
          setStatus('success');
          setMessage('验证成功！正在跳转...');
          setTimeout(() => {
            router.push('/?verified=true');
          }, 1500);
        } else {
          // 没有 session，可能验证失败或链接格式不对
          setStatus('error');
          setMessage('未找到验证信息。请检查验证链接是否正确。');
          setTimeout(() => {
            router.push('/login?error=no_session');
          }, 3000);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setStatus('error');
        setMessage('验证过程中发生错误，请重试');
        setTimeout(() => {
          router.push('/login?error=unknown');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <>
      <Head>
        <title>验证中 - 照片修复工具</title>
      </Head>
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <div className='text-center bg-white rounded-lg shadow-md p-8 max-w-md mx-4'>
          {status === 'loading' && (
            <>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#3290EE] mx-auto mb-4'></div>
              <p className='text-slate-600'>{message}</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div className='text-green-500 text-5xl mb-4'>✓</div>
              <p className='text-green-600 font-semibold mb-2'>{message}</p>
              <p className='text-sm text-slate-500'>您已自动登录</p>
            </>
          )}
          {status === 'error' && (
            <>
              <div className='text-red-500 text-5xl mb-4'>✗</div>
              <p className='text-red-600 font-semibold mb-2'>{message}</p>
              <p className='text-sm text-slate-500'>即将跳转到登录页面</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
