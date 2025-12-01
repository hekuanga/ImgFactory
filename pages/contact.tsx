import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from '../hooks/useTranslation';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Contact: NextPage = () => {
  const { t, language } = useTranslation();

  return (
    <div className='flex max-w-7xl mx-auto flex-col items-center justify-start py-2 min-h-screen bg-[#F7F4E9] dark:bg-slate-900 transition-colors duration-300'>
      <Head>
        <title>{t.legal.contact.title}</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-start text-center px-4 sm:px-6 lg:px-8 pt-16 pb-6'>
        <div className='max-w-4xl w-full text-left'>
          <h1 className='text-3xl sm:text-4xl font-bold mb-6 text-slate-900 dark:text-slate-100'>
            {t.legal.contact.title}
          </h1>
          
          <div className='prose prose-slate dark:prose-invert max-w-none mb-8'>
            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.contact.sections.company.title}</h2>
              <p className='mb-4'><strong>{t.legal.contact.sections.company.name}:</strong> {t.legal.contact.sections.company.value}</p>
              <p className='mb-4'><strong>{t.legal.contact.sections.company.registered}:</strong> {t.legal.contact.sections.company.location}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.contact.sections.contactInfo.title}</h2>
              <p className='mb-4'>
                <strong>{t.legal.contact.sections.contactInfo.general}:</strong>{' '}
                <a href='mailto:RaveLandBlueStar@gmail.com' className='text-blue-600 dark:text-blue-400 hover:underline'>
                  RaveLandBlueStar@gmail.com
                </a>
              </p>
              <p className='mb-4'>
                <strong>{t.legal.contact.sections.contactInfo.privacy}:</strong>{' '}
                <a href='mailto:RaveLandBlueStar@gmail.com' className='text-blue-600 dark:text-blue-400 hover:underline'>
                  RaveLandBlueStar@gmail.com
                </a>
              </p>
              <p className='mb-4'>
                <strong>{t.legal.contact.sections.contactInfo.legal}:</strong>{' '}
                <a href='mailto:RaveLandBlueStar@gmail.com' className='text-blue-600 dark:text-blue-400 hover:underline'>
                  RaveLandBlueStar@gmail.com
                </a>
              </p>
              <p className='mb-4'>
                <strong>{t.legal.contact.sections.contactInfo.refunds}:</strong>{' '}
                <a href='mailto:RaveLandBlueStar@gmail.com' className='text-blue-600 dark:text-blue-400 hover:underline'>
                  RaveLandBlueStar@gmail.com
                </a>
              </p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.contact.sections.gdprRights.title}</h2>
              <p className='mb-4'>{t.legal.contact.sections.gdprRights.content}</p>
              <ul className='list-disc pl-6 mb-4 space-y-2'>
                <li>{t.legal.contact.sections.gdprRights.right1}</li>
                <li>{t.legal.contact.sections.gdprRights.right2}</li>
                <li>{t.legal.contact.sections.gdprRights.right3}</li>
                <li>{t.legal.contact.sections.gdprRights.right4}</li>
                <li>{t.legal.contact.sections.gdprRights.right5}</li>
              </ul>
              <p className='mb-4'>{t.legal.contact.sections.gdprRights.responseTime}</p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold mb-4'>{t.legal.contact.sections.responseTime.title}</h2>
              <p className='mb-4'>{t.legal.contact.sections.responseTime.content}</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;

