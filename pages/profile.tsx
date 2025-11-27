import { NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

interface CreditHistory {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
}

const Profile: NextPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useTranslation();
  const [credits, setCredits] = useState<number | null>(null);
  const [history, setHistory] = useState<CreditHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCreditsAndHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await (await import('../lib/supabaseClient')).supabaseClient.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        const [creditsRes, historyRes] = await Promise.all([
          fetch('/api/credits/balance', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          }),
          fetch('/api/credits/history', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          })
        ]);

        const creditsData = await creditsRes.json();
        if (creditsData.success) {
          setCredits(creditsData.credits || 0);
        }

        const historyData = await historyRes.json();
        if (historyData.success) {
          setHistory(historyData.history || []);
        }
      } catch (error) {
        console.error('Load credits/history error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCreditsAndHistory();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { zh: string; en: string }> = {
      purchase: { zh: '购买', en: 'Purchase' },
      deduct: { zh: '扣除', en: 'Deduct' },
      refund: { zh: '退款', en: 'Refund' },
      bonus: { zh: '奖励', en: 'Bonus' }
    };
    return labels[type]?.[language] || type;
  };

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

  if (!user) {
    return (
      <div className='flex max-w-7xl mx-auto flex-col items-center justify-center min-h-screen bg-[#F7F4E9] dark:bg-slate-900'>
        <Header />
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <p className='text-slate-600 dark:text-slate-400 mb-4'>
              {language === 'zh' ? '请先登录' : 'Please login first'}
            </p>
            <Link
              href='/login'
              className='text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/80 dark:hover:bg-white/80 transition px-4 py-2 inline-block'
            >
              {t.user.login}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='flex max-w-7xl mx-auto flex-col items-center justify-center min-h-screen bg-[#F7F4E9] dark:bg-slate-900 transition-colors duration-300'>
      <Head>
        <title>{language === 'zh' ? '用户中心' : 'User Center'} - {t.nav.studio}</title>
      </Head>
      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-start px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        <h1 className='mx-auto max-w-5xl font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-normal text-slate-900 dark:text-slate-100 mb-6 transition-colors duration-300'>
          {language === 'zh' ? '用户中心' : 'User Center'}
        </h1>

        {/* 积分余额卡片 */}
        <div className='w-full max-w-2xl mb-8'>
          <div className='bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border-2 border-[#E8DEBB] dark:border-slate-700'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
                {t.user.creditsBalance}
              </h2>
              <Link
                href='/credits'
                className='text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/80 dark:hover:bg-white/80 transition px-4 py-2'
              >
                {t.user.rechargeCredits}
              </Link>
            </div>
            <div className='text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2'>
              {credits !== null ? credits : 0}
            </div>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              {t.user.creditsDescription}
            </p>
          </div>
        </div>

        {/* 积分历史记录 */}
        <div className='w-full max-w-2xl'>
          <div className='bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border-2 border-[#E8DEBB] dark:border-slate-700'>
            <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4'>
              {language === 'zh' ? '积分历史' : 'Credit History'}
            </h2>
            {history.length === 0 ? (
              <div className='text-center py-8 text-slate-600 dark:text-slate-400'>
                {language === 'zh' ? '暂无积分记录' : 'No credit history'}
              </div>
            ) : (
              <div className='space-y-3'>
                {history.map((item) => (
                  <div
                    key={item.id}
                    className='flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg'
                  >
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <span className={`text-sm font-medium ${
                          item.amount > 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {item.amount > 0 ? '+' : ''}{item.amount}
                        </span>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          {getTypeLabel(item.type)}
                        </span>
                      </div>
                      {item.description && (
                        <p className='text-xs text-slate-500 dark:text-slate-400'>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className='text-xs text-slate-500 dark:text-slate-400'>
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;

