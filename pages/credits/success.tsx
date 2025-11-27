import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';

const CreditsSuccessPage: NextPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useTranslation();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { session_id, amount } = router.query;

  useEffect(() => {
    const loadCredits = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await (await import('../../lib/supabaseClient')).supabaseClient.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        // 等待一下，确保webhook已经处理完成
        await new Promise(resolve => setTimeout(resolve, 2000));

        const res = await fetch('/api/credits/balance', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        const data = await res.json();
        if (data.success) {
          setCredits(data.credits || 0);
        }
      } catch (error) {
        console.error('Load credits error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && session_id) {
      loadCredits();
    } else {
      setLoading(false);
    }
  }, [user, session_id]);

  if (authLoading || loading) {
    return (
      <div className='flex max-w-7xl mx-auto flex-col items-center justify-center min-h-screen bg-[#F7F4E9] dark:bg-slate-900'>
        <Header />
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-slate-600 dark:text-slate-400'>{t.user.loading}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='flex max-w-7xl mx-auto flex-col items-center justify-center min-h-screen bg-[#F7F4E9] dark:bg-slate-900 transition-colors duration-300'>
      <Head>
        <title>{`${language === 'zh' ? '支付成功' : 'Payment Success'} - ${t.nav.studio}`}</title>
      </Head>
      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        <div className='w-full max-w-md text-center'>
          <div className='bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border-2 border-[#E8DEBB] dark:border-slate-700 mb-6'>
            {/* 成功图标 */}
            <div className='mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4'>
              <svg className='w-8 h-8 text-green-600 dark:text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
              </svg>
            </div>
            
            <h1 className='text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2'>
              {t.user.paymentSuccess}
            </h1>
            
            {amount && (
              <p className='text-lg text-slate-700 dark:text-slate-300 mb-4'>
                {t.user.creditsPurchased.replace('{{amount}}', amount as string)}
              </p>
            )}
            
            {credits !== null && (
              <div className='bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-4'>
                <p className='text-sm text-slate-600 dark:text-slate-400 mb-1'>
                  {t.user.creditsBalance}
                </p>
                <p className='text-3xl font-bold text-slate-900 dark:text-slate-100'>
                  {credits}
                </p>
              </div>
            )}
            
            <div className='flex gap-3 justify-center'>
              <Link
                href='/profile'
                className='flex-1 text-center text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/80 dark:hover:bg-white/80 transition px-4 py-2'
              >
                {t.user.viewDetails}
              </Link>
              <Link
                href='/restore'
                className='flex-1 text-center text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition px-4 py-2'
              >
                {t.user.startUsing}
              </Link>
            </div>
          </div>
          
          <Link
            href='/credits'
            className='text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition'
          >
            {t.user.backToCredits}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreditsSuccessPage;

