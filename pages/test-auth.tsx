import { NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

const TestAuth: NextPage = () => {
  const { user, session, loading } = useAuth();
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    // 测试配置
    const testConfig = async () => {
      setTestLoading(true);
      try {
        const response = await fetch('/api/test-supabase');
        const data = await response.json();
        setConfigStatus(data);
      } catch (error) {
        console.error('Config test error:', error);
        setConfigStatus({ success: false, error: 'Failed to test configuration' });
      } finally {
        setTestLoading(false);
      }
    };

    testConfig();
  }, []);

  const testGetSession = async () => {
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        alert(`Session: ${session ? 'Found' : 'Not found'}\nUser: ${session?.user?.email || 'None'}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className='flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen px-4'>
      <Head>
        <title>Supabase 配置验证 - 照片修复工具</title>
      </Head>
      
      <main className='w-full max-w-2xl mt-20'>
        <h1 className='text-3xl font-bold text-center mb-8 text-slate-900'>
          Supabase 配置验证
        </h1>

        {/* 环境变量配置检查 */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>环境变量配置</h2>
          {testLoading ? (
            <div className='text-center py-4'>检查中...</div>
          ) : configStatus ? (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-slate-600'>配置状态:</span>
                <span className={`font-medium ${configStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                  {configStatus.success ? '✓ 正常' : '✗ 错误'}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-slate-600'>Supabase URL:</span>
                <span className='font-mono text-xs'>{configStatus.clientConfig?.url || 'Not set'}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-slate-600'>Anon Key:</span>
                <span className={`font-medium ${configStatus.clientConfig?.hasAnonKey ? 'text-green-600' : 'text-red-600'}`}>
                  {configStatus.clientConfig?.hasAnonKey ? '✓ 已设置' : '✗ 未设置'}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-slate-600'>Service Role Key:</span>
                <span className={`font-medium ${configStatus.clientConfig?.hasServiceRoleKey ? 'text-green-600' : 'text-yellow-600'}`}>
                  {configStatus.clientConfig?.hasServiceRoleKey ? '✓ 已设置' : '⚠ 未设置（可选）'}
                </span>
              </div>
              {configStatus.connectionTest && (
                <div className='mt-4 pt-4 border-t'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-slate-600'>连接测试:</span>
                    <span className={`font-medium ${configStatus.connectionTest.success ? 'text-green-600' : 'text-red-600'}`}>
                      {configStatus.connectionTest.success ? '✓ 成功' : '✗ 失败'}
                    </span>
                  </div>
                  {configStatus.connectionTest.error && (
                    <div className='mt-2 text-sm text-red-600'>
                      错误: {configStatus.connectionTest.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className='text-center py-4 text-red-600'>无法获取配置信息</div>
          )}
        </div>

        {/* Auth Context 状态 */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Auth Context 状态</h2>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-slate-600'>加载状态:</span>
              <span className={`font-medium ${loading ? 'text-yellow-600' : 'text-green-600'}`}>
                {loading ? '加载中...' : '已完成'}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-slate-600'>用户状态:</span>
              <span className={`font-medium ${user ? 'text-green-600' : 'text-gray-600'}`}>
                {user ? '✓ 已登录' : '未登录'}
              </span>
            </div>
            {user && (
              <>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-slate-600'>用户邮箱:</span>
                  <span className='font-mono text-xs'>{user.email}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-slate-600'>用户 ID:</span>
                  <span className='font-mono text-xs'>{user.id.substring(0, 20)}...</span>
                </div>
              </>
            )}
            <div className='flex items-center justify-between'>
              <span className='text-sm text-slate-600'>Session 状态:</span>
              <span className={`font-medium ${session ? 'text-green-600' : 'text-gray-600'}`}>
                {session ? '✓ 存在' : '不存在'}
              </span>
            </div>
          </div>
        </div>

        {/* 测试按钮 */}
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-xl font-semibold mb-4'>功能测试</h2>
          <div className='space-y-3'>
            <button
              onClick={testGetSession}
              className='w-full bg-[#3290EE] text-white font-medium px-4 py-3 rounded-lg hover:bg-[#3290EE]/80 transition'
            >
              测试 getSession()
            </button>
            <div className='text-sm text-slate-600 mt-4'>
              <p className='mb-2'>验证步骤：</p>
              <ol className='list-decimal list-inside space-y-1'>
                <li>检查环境变量是否正确配置</li>
                <li>检查 Supabase 连接是否正常</li>
                <li>测试 getSession() 功能</li>
                <li>验证 Auth Context 是否正常工作</li>
              </ol>
            </div>
          </div>
        </div>

        {/* 环境变量要求 */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6'>
          <h3 className='text-lg font-semibold mb-2 text-blue-900'>需要的环境变量</h3>
          <div className='text-sm text-blue-800 space-y-1'>
            <p><code className='bg-blue-100 px-2 py-1 rounded'>NEXT_PUBLIC_SUPABASE_URL</code> - Supabase 项目 URL（必需）</p>
            <p><code className='bg-blue-100 px-2 py-1 rounded'>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Supabase 匿名密钥（必需）</p>
            <p><code className='bg-blue-100 px-2 py-1 rounded'>SUPABASE_SERVICE_ROLE_KEY</code> - Supabase 服务角色密钥（可选，用于服务端操作）</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestAuth;

