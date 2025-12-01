import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from '../hooks/useTranslation';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TermsOfService: NextPage = () => {
  const { t, language } = useTranslation();

  return (
    <div className='flex max-w-7xl mx-auto flex-col items-center justify-start py-2 min-h-screen bg-[#F7F4E9] dark:bg-slate-900 transition-colors duration-300'>
      <Head>
        <title>{t.legal.termsOfService.title}</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-start text-center px-4 sm:px-6 lg:px-8 pt-16 pb-6'>
        <div className='max-w-4xl w-full text-left'>
          <h1 className='text-3xl sm:text-4xl font-bold mb-6 text-slate-900 dark:text-slate-100'>
            {t.legal.termsOfService.title}
          </h1>
          
          <div className='prose prose-slate dark:prose-invert max-w-none mb-8'>
            <p className='text-sm text-slate-600 dark:text-slate-400 mb-6'>
              {t.legal.termsOfService.lastUpdated}: {new Date().toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')}
            </p>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.termsOfService.sections.acceptance.title}</h2>
              <p className='mb-4'>{t.legal.termsOfService.sections.acceptance.content}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.termsOfService.sections.userResponsibility.title}</h2>
              <ul className='list-disc pl-6 mb-4 space-y-2'>
                <li>{t.legal.termsOfService.sections.userResponsibility.ownPhotos}</li>
                <li>{t.legal.termsOfService.sections.userResponsibility.noIllegal}</li>
                <li>{t.legal.termsOfService.sections.userResponsibility.noThirdParty}</li>
              </ul>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.termsOfService.sections.serviceDescription.title}</h2>
              <p className='mb-4'>{t.legal.termsOfService.sections.serviceDescription.content}</p>
              <p className='mb-4 font-semibold text-yellow-600 dark:text-yellow-400'>
                {t.legal.termsOfService.sections.serviceDescription.noGuarantee}
              </p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.termsOfService.sections.payment.title}</h2>
              <ul className='list-disc pl-6 mb-4 space-y-2'>
                <li>{t.legal.termsOfService.sections.payment.credits}</li>
                <li>{t.legal.termsOfService.sections.payment.refund}</li>
                <li>{t.legal.termsOfService.sections.payment.currency}</li>
              </ul>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.termsOfService.sections.intellectualProperty.title}</h2>
              <p className='mb-4'>{t.legal.termsOfService.sections.intellectualProperty.userOwnership}</p>
              <p className='mb-4'>{t.legal.termsOfService.sections.intellectualProperty.platformOwnership}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.termsOfService.sections.disclaimer.title}</h2>
              <p className='mb-4'>{t.legal.termsOfService.sections.disclaimer.content}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.termsOfService.sections.termination.title}</h2>
              <p className='mb-4'>{t.legal.termsOfService.sections.termination.content}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.termsOfService.sections.changes.title}</h2>
              <p className='mb-4'>{t.legal.termsOfService.sections.changes.content}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.termsOfService.sections.contact.title}</h2>
              <p className='mb-4'>{t.legal.termsOfService.sections.contact.content}</p>
              <p className='mb-4'>
                <strong>{t.legal.termsOfService.sections.contact.email}:</strong>{' '}
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

export default TermsOfService;

