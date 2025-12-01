import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from '../hooks/useTranslation';
import Header from '../components/Header';
import Footer from '../components/Footer';

const DataProcessing: NextPage = () => {
  const { t, language } = useTranslation();

  return (
    <div className='flex max-w-7xl mx-auto flex-col items-center justify-start py-2 min-h-screen bg-[#F7F4E9] dark:bg-slate-900 transition-colors duration-300'>
      <Head>
        <title>{t.legal.dataProcessing.title}</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-start text-center px-4 sm:px-6 lg:px-8 pt-16 pb-6'>
        <div className='max-w-4xl w-full text-left'>
          <h1 className='text-3xl sm:text-4xl font-bold mb-6 text-slate-900 dark:text-slate-100'>
            {t.legal.dataProcessing.title}
          </h1>
          
          <div className='prose prose-slate dark:prose-invert max-w-none mb-8'>
            <p className='text-sm text-slate-600 dark:text-slate-400 mb-6'>
              {t.legal.dataProcessing.lastUpdated}: {new Date().toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')}
            </p>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.dataProcessing.sections.roles.title}</h2>
              <p className='mb-4'>{t.legal.dataProcessing.sections.roles.controller}</p>
              <p className='mb-4'>{t.legal.dataProcessing.sections.roles.processors}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.dataProcessing.sections.processors.title}</h2>
              <h3 className='text-xl font-semibold mb-3 mt-4'>Supabase</h3>
              <ul className='list-disc pl-6 mb-4 space-y-2'>
                <li>{t.legal.dataProcessing.sections.processors.supabase.data}</li>
                <li>{t.legal.dataProcessing.sections.processors.supabase.purpose}</li>
                <li>{t.legal.dataProcessing.sections.processors.supabase.location}</li>
              </ul>

              <h3 className='text-xl font-semibold mb-3 mt-4'>Stripe</h3>
              <ul className='list-disc pl-6 mb-4 space-y-2'>
                <li>{t.legal.dataProcessing.sections.processors.stripe.data}</li>
                <li>{t.legal.dataProcessing.sections.processors.stripe.purpose}</li>
                <li>{t.legal.dataProcessing.sections.processors.stripe.location}</li>
              </ul>

              <h3 className='text-xl font-semibold mb-3 mt-4'>Vercel</h3>
              <ul className='list-disc pl-6 mb-4 space-y-2'>
                <li>{t.legal.dataProcessing.sections.processors.vercel.data}</li>
                <li>{t.legal.dataProcessing.sections.processors.vercel.purpose}</li>
                <li>{t.legal.dataProcessing.sections.processors.vercel.location}</li>
              </ul>

              <h3 className='text-xl font-semibold mb-3 mt-4'>Bytescale</h3>
              <ul className='list-disc pl-6 mb-4 space-y-2'>
                <li>{t.legal.dataProcessing.sections.processors.bytescale.data}</li>
                <li>{t.legal.dataProcessing.sections.processors.bytescale.purpose}</li>
                <li>{t.legal.dataProcessing.sections.processors.bytescale.location}</li>
              </ul>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.dataProcessing.sections.safeguards.title}</h2>
              <p className='mb-4'>{t.legal.dataProcessing.sections.safeguards.content}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.dataProcessing.sections.contact.title}</h2>
              <p className='mb-4'>{t.legal.dataProcessing.sections.contact.content}</p>
              <p className='mb-4'>
                <strong>{t.legal.dataProcessing.sections.contact.email}:</strong>{' '}
                <a href='mailto:RaveLandBlueStar@gmail.com' className='text-blue-600 dark:text-blue-400 hover:underline'>
                  RaveLandBlueStar@gmail.com
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

export default DataProcessing;

