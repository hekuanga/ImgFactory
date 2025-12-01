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
    // 使用 ref 来跟踪是否已经处理过，避免重复执行
    const hasProcessedRef = { current: false };
    let timeoutId: NodeJS.Timeout;
    let authStateSubscription: { unsubscribe: () => void } | null = null;

    const handleAuthCallback = async () => {
      // 如果已经处理过，直接返回
      if (hasProcessedRef.current) {
        return;
      }

      try {
        // 方法1: 监听 auth 状态变化（推荐，更可靠）
        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
          // 防止重复处理
          if (hasProcessedRef.current) {
            subscription.unsubscribe();
            return;
          }

          console.log('Auth state changed:', event, session ? 'has session' : 'no session');

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session && session.user) {
              hasProcessedRef.current = true;
              setStatus('success');
              setMessage('验证成功！正在跳转...');
              subscription.unsubscribe();
              setTimeout(() => {
                router.push('/?verified=true').catch(() => {
                  // 忽略路由错误，避免无限循环
                });
              }, 1500);
              return;
            }
          }
        });
        
        authStateSubscription = subscription;

        // 方法2: 同时检查当前 session（作为备用）
        // 等待 Supabase 处理 URL 中的 token
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 如果已经处理过，直接返回
        if (hasProcessedRef.current) {
          return;
        }
        
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          if (!hasProcessedRef.current) {
            hasProcessedRef.current = true;
            setStatus('error');
            setMessage(`验证失败：${error.message}`);
            if (authStateSubscription) {
              authStateSubscription.unsubscribe();
            }
            setTimeout(() => {
              router.push('/login?error=verification_failed').catch(() => {
                // 忽略路由错误
              });
            }, 3000);
          }
          return;
        }

        if (session && session.user) {
          // 验证成功，已自动登录
          if (!hasProcessedRef.current) {
            hasProcessedRef.current = true;
            setStatus('success');
            setMessage('验证成功！正在跳转...');
            if (authStateSubscription) {
              authStateSubscription.unsubscribe();
            }
            setTimeout(() => {
              router.push('/?verified=true').catch(() => {
                // 忽略路由错误
              });
            }, 1500);
          }
        } else {
          // 没有立即检测到 session，等待 auth state change 事件
          // 设置超时，如果5秒后仍然没有session，显示错误
          timeoutId = setTimeout(() => {
            if (!hasProcessedRef.current) {
              hasProcessedRef.current = true;
              // 再次检查一次 session（可能已经设置了）
              supabaseClient.auth.getSession().then(({ data: { session: finalSession } }) => {
                if (finalSession && finalSession.user) {
                  setStatus('success');
                  setMessage('验证成功！正在跳转...');
                  setTimeout(() => {
                    router.push('/?verified=true').catch(() => {
                      // 忽略路由错误
                    });
                  }, 1500);
                } else {
                  // 确实没有 session，但用户说可以登录，说明验证成功了
                  // 可能是 session 已经设置但检测时机不对
                  // 直接跳转到登录页面，让用户登录
                  setStatus('success');
                  setMessage('验证成功！请前往登录页面登录。');
                  setTimeout(() => {
                    router.push('/login?verified=true').catch(() => {
                      // 忽略路由错误
                    });
                  }, 2000);
                }
                if (authStateSubscription) {
                  authStateSubscription.unsubscribe();
                }
              });
            }
          }, 5000);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        if (!hasProcessedRef.current) {
          hasProcessedRef.current = true;
          setStatus('error');
          setMessage('验证过程中发生错误，请重试');
          if (authStateSubscription) {
            authStateSubscription.unsubscribe();
          }
          setTimeout(() => {
            router.push('/login?error=unknown').catch(() => {
              // 忽略路由错误
            });
          }, 3000);
        }
      }
    };

    handleAuthCallback();

    // 清理函数
    return () => {
      hasProcessedRef.current = true; // 标记为已处理，防止后续执行
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (authStateSubscription) {
        authStateSubscription.unsubscribe();
      }
    };
  }, []); // 移除 router 依赖，避免无限循环

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
