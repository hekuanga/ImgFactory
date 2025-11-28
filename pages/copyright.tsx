import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from '../hooks/useTranslation';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Copyright: NextPage = () => {
  const { t, language } = useTranslation();

  return (
    <div className='flex max-w-7xl mx-auto flex-col items-center justify-start py-2 min-h-screen bg-[#F7F4E9] dark:bg-slate-900 transition-colors duration-300'>
      <Head>
        <title>{t.legal.copyright.title}</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-start text-center px-4 sm:px-6 lg:px-8 pt-16 pb-6'>
        <div className='max-w-4xl w-full text-left'>
          <h1 className='text-3xl sm:text-4xl font-bold mb-6 text-slate-900 dark:text-slate-100'>
            {t.legal.copyright.title}
          </h1>
          
          <div className='prose prose-slate dark:prose-invert max-w-none mb-8'>
            <p className='text-sm text-slate-600 dark:text-slate-400 mb-6'>
              {t.legal.copyright.lastUpdated}: {new Date().toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')}
            </p>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.copyright.sections.userContent.title}</h2>
              <p className='mb-4'>{t.legal.copyright.sections.userContent.ownership}</p>
              <p className='mb-4'>{t.legal.copyright.sections.userContent.license}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.copyright.sections.platformContent.title}</h2>
              <p className='mb-4'>{t.legal.copyright.sections.platformContent.ownership}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.copyright.sections.noTraining.title}</h2>
              <p className='mb-4 font-semibold text-green-600 dark:text-green-400'>
                {t.legal.copyright.sections.noTraining.content}
              </p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.copyright.sections.noSharing.title}</h2>
              <p className='mb-4'>{t.legal.copyright.sections.noSharing.content}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.copyright.sections.contact.title}</h2>
              <p className='mb-4'>{t.legal.copyright.sections.contact.content}</p>
              <p className='mb-4'>
                <strong>{t.legal.copyright.sections.contact.email}:</strong>{' '}
                <a href='mailto:copyright@sweetstar.ai' className='text-blue-600 dark:text-blue-400 hover:underline'>
                  copyright@sweetstar.ai
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

export default Copyright;

