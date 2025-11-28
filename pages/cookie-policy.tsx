import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from '../hooks/useTranslation';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CookiePolicy: NextPage = () => {
  const { t, language } = useTranslation();

  return (
    <div className='flex max-w-7xl mx-auto flex-col items-center justify-start py-2 min-h-screen bg-[#F7F4E9] dark:bg-slate-900 transition-colors duration-300'>
      <Head>
        <title>{t.legal.cookiePolicy.title}</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-start text-center px-4 sm:px-6 lg:px-8 pt-16 pb-6'>
        <div className='max-w-4xl w-full text-left'>
          <h1 className='text-3xl sm:text-4xl font-bold mb-6 text-slate-900 dark:text-slate-100'>
            {t.legal.cookiePolicy.title}
          </h1>
          
          <div className='prose prose-slate dark:prose-invert max-w-none mb-8'>
            <p className='text-sm text-slate-600 dark:text-slate-400 mb-6'>
              {t.legal.cookiePolicy.lastUpdated}: {new Date().toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')}
            </p>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.cookiePolicy.sections.whatAreCookies.title}</h2>
              <p className='mb-4'>{t.legal.cookiePolicy.sections.whatAreCookies.content}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.cookiePolicy.sections.types.title}</h2>
              <h3 className='text-xl font-semibold mb-3 mt-4'>{t.legal.cookiePolicy.sections.types.necessary.title}</h3>
              <p className='mb-4'>{t.legal.cookiePolicy.sections.types.necessary.content}</p>
              <ul className='list-disc pl-6 mb-4 space-y-2'>
                <li><strong>Supabase Auth:</strong> {t.legal.cookiePolicy.sections.types.necessary.supabase}</li>
              </ul>

              <h3 className='text-xl font-semibold mb-3 mt-4'>{t.legal.cookiePolicy.sections.types.functional.title}</h3>
              <p className='mb-4'>{t.legal.cookiePolicy.sections.types.functional.content}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.cookiePolicy.sections.thirdParty.title}</h2>
              <ul className='list-disc pl-6 mb-4 space-y-2'>
                <li><strong>Supabase:</strong> {t.legal.cookiePolicy.sections.thirdParty.supabase}</li>
                <li><strong>Stripe:</strong> {t.legal.cookiePolicy.sections.thirdParty.stripe}</li>
              </ul>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.cookiePolicy.sections.management.title}</h2>
              <p className='mb-4'>{t.legal.cookiePolicy.sections.management.content}</p>
              <p className='mb-4'>{t.legal.cookiePolicy.sections.management.note}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.cookiePolicy.sections.contact.title}</h2>
              <p className='mb-4'>{t.legal.cookiePolicy.sections.contact.content}</p>
              <p className='mb-4'>
                <strong>{t.legal.cookiePolicy.sections.contact.email}:</strong>{' '}
                <a href='mailto:privacy@sweetstar.ai' className='text-blue-600 dark:text-blue-400 hover:underline'>
                  privacy@sweetstar.ai
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicy;

