import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

const EmailVerificationGuide: NextPage = () => {
  return (
    <div className='flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen'>
      <Head>
        <title>邮箱验证指南 - 照片修复工具</title>
      </Head>
      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-center px-4 mt-20'>
        <div className='w-full max-w-2xl'>
          <h1 className='text-3xl font-bold text-center mb-8 text-slate-900'>
            邮箱验证指南
          </h1>

          {/* 什么是邮箱验证 */}
          <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
            <h2 className='text-2xl font-semibold mb-4 text-slate-900'>
              什么是邮箱验证？
            </h2>
            <div className='text-slate-700 space-y-3'>
              <p>
                邮箱验证是一种安全措施，用于确认您提供的邮箱地址是真实有效的。这样可以：
              </p>
              <ul className='list-disc list-inside space-y-2 ml-4'>
                <li>防止使用虚假邮箱注册账户</li>
                <li>确保重要通知能送达您的邮箱</li>
                <li>提高账户安全性</li>
                <li>在忘记密码时能够找回账户</li>
              </ul>
            </div>
          </div>

          {/* 如何验证邮箱 */}
          <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
            <h2 className='text-2xl font-semibold mb-4 text-slate-900'>
              如何验证邮箱？
            </h2>
            <div className='space-y-4'>
              <div className='border-l-4 border-[#3290EE] pl-4'>
                <h3 className='font-semibold text-lg mb-2'>步骤 1：注册账户</h3>
                <p className='text-slate-600'>
                  在注册页面填写您的邮箱地址和密码，完成注册。
                </p>
              </div>

              <div className='border-l-4 border-[#3290EE] pl-4'>
                <h3 className='font-semibold text-lg mb-2'>步骤 2：查收验证邮件</h3>
                <p className='text-slate-600 mb-2'>
                  注册成功后，系统会立即向您的邮箱发送一封验证邮件。
                </p>
                <div className='bg-yellow-50 border border-yellow-200 rounded p-3 mt-2'>
                  <p className='text-sm text-yellow-800'>
                    <strong>提示：</strong> 如果收件箱中没有，请检查：
                  </p>
                  <ul className='list-disc list-inside mt-2 text-sm text-yellow-800'>
                    <li>垃圾邮件文件夹</li>
                    <li>促销邮件文件夹</li>
                    <li>等待 1-2 分钟（邮件可能延迟）</li>
                  </ul>
                </div>
              </div>

              <div className='border-l-4 border-[#3290EE] pl-4'>
                <h3 className='font-semibold text-lg mb-2'>步骤 3：点击验证链接</h3>
                <p className='text-slate-600'>
                  打开验证邮件，点击邮件中的"验证邮箱"或"Confirm Email"按钮/链接。
                </p>
              </div>

              <div className='border-l-4 border-[#3290EE] pl-4'>
                <h3 className='font-semibold text-lg mb-2'>步骤 4：完成验证</h3>
                <p className='text-slate-600'>
                  点击链接后，会自动跳转到验证成功页面，然后您就可以正常登录了！
                </p>
              </div>
            </div>
          </div>

          {/* 验证邮件示例 */}
          <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
            <h2 className='text-2xl font-semibold mb-4 text-slate-900'>
              验证邮件示例
            </h2>
            <div className='bg-gray-50 border border-gray-200 rounded p-4 font-mono text-sm'>
              <div className='mb-2'>
                <strong>发件人：</strong> noreply@mail.app.supabase.io
              </div>
              <div className='mb-2'>
                <strong>主题：</strong> 确认您的邮箱地址
              </div>
              <div className='mb-4 border-t pt-4'>
                <p className='mb-2'>您好，</p>
                <p className='mb-2'>
                  感谢您注册我们的服务！请点击下面的链接验证您的邮箱地址：
                </p>
                <div className='bg-blue-100 p-2 rounded my-2 text-center'>
                  <a href='#' className='text-blue-600 underline'>
                    [验证邮箱] 按钮或链接
                  </a>
                </div>
                <p className='text-xs text-gray-500 mt-4'>
                  如果按钮无法点击，请复制以下链接到浏览器：<br />
                  https://your-project.supabase.co/auth/v1/verify?token=...
                </p>
              </div>
            </div>
          </div>

          {/* 常见问题 */}
          <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
            <h2 className='text-2xl font-semibold mb-4 text-slate-900'>
              常见问题
            </h2>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2'>Q: 为什么注册后无法立即登录？</h3>
                <p className='text-slate-600'>
                  A: 这是安全设置。为了保护您的账户安全，需要先验证邮箱才能登录。请按照上述步骤完成邮箱验证。
                </p>
              </div>
              <div>
                <h3 className='font-semibold mb-2'>Q: 验证链接过期了怎么办？</h3>
                <p className='text-slate-600'>
                  A: 验证链接通常有效期为 24 小时。如果过期，您可以：
                </p>
                <ul className='list-disc list-inside ml-4 mt-2 text-slate-600'>
                  <li>重新注册账户</li>
                  <li>联系客服重新发送验证邮件</li>
                </ul>
              </div>
              <div>
                <h3 className='font-semibold mb-2'>Q: 可以跳过邮箱验证吗？</h3>
                <p className='text-slate-600'>
                  A: 在生产环境中，邮箱验证是必需的。但在开发环境中，管理员可以在 Supabase Dashboard 中禁用邮箱验证功能。
                </p>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className='text-center space-x-4'>
            <Link
              href='/login'
              className='inline-block bg-[#3290EE] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#3290EE]/80 transition'
            >
              前往登录
            </Link>
            <Link
              href='/register'
              className='inline-block border border-gray-300 text-gray-700 font-medium px-6 py-3 rounded-lg hover:bg-gray-50 transition'
            >
              重新注册
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmailVerificationGuide;

