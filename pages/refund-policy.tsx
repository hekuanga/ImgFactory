import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from '../hooks/useTranslation';
import Header from '../components/Header';
import Footer from '../components/Footer';

const RefundPolicy: NextPage = () => {
  const { t, language } = useTranslation();

  return (
    <div className='flex max-w-7xl mx-auto flex-col items-center justify-start py-2 min-h-screen bg-[#F7F4E9] dark:bg-slate-900 transition-colors duration-300'>
      <Head>
        <title>{t.legal.refundPolicy.title}</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-start text-center px-4 sm:px-6 lg:px-8 pt-16 pb-6'>
        <div className='max-w-4xl w-full text-left'>
          <h1 className='text-3xl sm:text-4xl font-bold mb-6 text-slate-900 dark:text-slate-100'>
            {t.legal.refundPolicy.title}
          </h1>
          
          <div className='prose prose-slate dark:prose-invert max-w-none mb-8'>
            <p className='text-sm text-slate-600 dark:text-slate-400 mb-6'>
              {t.legal.refundPolicy.lastUpdated}: {new Date().toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')}
            </p>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.refundPolicy.sections.digitalContent.title}</h2>
              <p className='mb-4'>{t.legal.refundPolicy.sections.digitalContent.content}</p>
              <p className='mb-4 font-semibold text-yellow-600 dark:text-yellow-400'>
                {t.legal.refundPolicy.sections.digitalContent.note}
              </p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.refundPolicy.sections.refundEligibility.title}</h2>
              <ul className='list-disc pl-6 mb-4 space-y-2'>
                <li>{t.legal.refundPolicy.sections.refundEligibility.technical}</li>
                <li>{t.legal.refundPolicy.sections.refundEligibility.duplicate}</li>
                <li>{t.legal.refundPolicy.sections.refundEligibility.unauthorized}</li>
              </ul>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.refundPolicy.sections.subscription.title}</h2>
              <p className='mb-4'>{t.legal.refundPolicy.sections.subscription.autoRenewal}</p>
              <p className='mb-4'>{t.legal.refundPolicy.sections.subscription.cancellation}</p>
              <p className='mb-4'>
                <a 
                  href='/billing/portal' 
                  className='text-blue-600 dark:text-blue-400 hover:underline'
                >
                  {t.legal.refundPolicy.sections.subscription.portalLink}
                </a>
              </p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.refundPolicy.sections.processingTime.title}</h2>
              <p className='mb-4'>{t.legal.refundPolicy.sections.processingTime.content}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.refundPolicy.sections.europeanRights.title}</h2>
              <p className='mb-4'>{t.legal.refundPolicy.sections.europeanRights.content}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.refundPolicy.sections.contact.title}</h2>
              <p className='mb-4'>{t.legal.refundPolicy.sections.contact.content}</p>
              <p className='mb-4'>
                <strong>{t.legal.refundPolicy.sections.contact.email}:</strong>{' '}
                <a href='mailto:refunds@sweetstar.ai' className='text-blue-600 dark:text-blue-400 hover:underline'>
                  refunds@sweetstar.ai
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

export default RefundPolicy;

