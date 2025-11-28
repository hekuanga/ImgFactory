import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from '../hooks/useTranslation';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPolicy: NextPage = () => {
  const { t, language } = useTranslation();

  return (
    <div className='flex max-w-7xl mx-auto flex-col items-center justify-start py-2 min-h-screen bg-[#F7F4E9] dark:bg-slate-900 transition-colors duration-300'>
      <Head>
        <title>{t.legal.privacyPolicy.title}</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-start text-center px-4 sm:px-6 lg:px-8 pt-16 pb-6'>
        <div className='max-w-4xl w-full text-left'>
          <h1 className='text-3xl sm:text-4xl font-bold mb-6 text-slate-900 dark:text-slate-100'>
            {t.legal.privacyPolicy.title}
          </h1>
          
          <div className='prose prose-slate dark:prose-invert max-w-none mb-8'>
            <p className='text-sm text-slate-600 dark:text-slate-400 mb-6'>
              {t.legal.privacyPolicy.lastUpdated}: {new Date().toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')}
            </p>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.privacyPolicy.sections.introduction.title}</h2>
              <p className='mb-4'>{t.legal.privacyPolicy.sections.introduction.content}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.privacyPolicy.sections.dataCollection.title}</h2>
              <h3 className='text-xl font-semibold mb-3 mt-4'>{t.legal.privacyPolicy.sections.dataCollection.types.title}</h3>
              <ul className='list-disc pl-6 mb-4 space-y-2'>
                <li>{t.legal.privacyPolicy.sections.dataCollection.types.photos}</li>
                <li>{t.legal.privacyPolicy.sections.dataCollection.types.accountInfo}</li>
                <li>{t.legal.privacyPolicy.sections.dataCollection.types.paymentInfo}</li>
                <li>{t.legal.privacyPolicy.sections.dataCollection.types.usageData}</li>
              </ul>
              <p className='mb-4 font-semibold text-red-600 dark:text-red-400'>
                {t.legal.privacyPolicy.sections.dataCollection.sensitiveNote}
              </p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.privacyPolicy.sections.thirdParty.title}</h2>
              <ul className='list-disc pl-6 mb-4 space-y-2'>
                <li><strong>Supabase:</strong> {t.legal.privacyPolicy.sections.thirdParty.supabase}</li>
                <li><strong>Stripe:</strong> {t.legal.privacyPolicy.sections.thirdParty.stripe}</li>
                <li><strong>Vercel:</strong> {t.legal.privacyPolicy.sections.thirdParty.vercel}</li>
                <li><strong>Bytescale:</strong> {t.legal.privacyPolicy.sections.thirdParty.bytescale}</li>
              </ul>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.privacyPolicy.sections.dataUsage.title}</h2>
              <ul className='list-disc pl-6 mb-4 space-y-2'>
                <li>{t.legal.privacyPolicy.sections.dataUsage.purpose1}</li>
                <li>{t.legal.privacyPolicy.sections.dataUsage.purpose2}</li>
                <li>{t.legal.privacyPolicy.sections.dataUsage.purpose3}</li>
              </ul>
              <p className='mb-4 font-semibold'>
                {t.legal.privacyPolicy.sections.dataUsage.noTraining}
              </p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.privacyPolicy.sections.dataRetention.title}</h2>
              <p className='mb-4'>{t.legal.privacyPolicy.sections.dataRetention.automaticDeletion}</p>
              <p className='mb-4'>{t.legal.privacyPolicy.sections.dataRetention.userDeletion}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.privacyPolicy.sections.userRights.title}</h2>
              <h3 className='text-xl font-semibold mb-3 mt-4'>GDPR {t.legal.privacyPolicy.sections.userRights.rights}</h3>
              <ul className='list-disc pl-6 mb-4 space-y-2'>
                <li>{t.legal.privacyPolicy.sections.userRights.access}</li>
                <li>{t.legal.privacyPolicy.sections.userRights.deletion}</li>
                <li>{t.legal.privacyPolicy.sections.userRights.portability}</li>
                <li>{t.legal.privacyPolicy.sections.userRights.objection}</li>
                <li>{t.legal.privacyPolicy.sections.userRights.restriction}</li>
              </ul>
              <h3 className='text-xl font-semibold mb-3 mt-4'>CCPA {t.legal.privacyPolicy.sections.userRights.rights}</h3>
              <p className='mb-4'>{t.legal.privacyPolicy.sections.userRights.ccpa}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.privacyPolicy.sections.jurisdiction.title}</h2>
              <p className='mb-4'>{t.legal.privacyPolicy.sections.jurisdiction.content}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.privacyPolicy.sections.contact.title}</h2>
              <p className='mb-4'>{t.legal.privacyPolicy.sections.contact.content}</p>
              <p className='mb-4'>
                <strong>{t.legal.privacyPolicy.sections.contact.email}:</strong>{' '}
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

export default PrivacyPolicy;

