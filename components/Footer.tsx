import Link from 'next/link';
import { useTranslation } from '../hooks/useTranslation';

export default function Footer() {
  const { t, language } = useTranslation();
  
  return (
    <footer className='relative w-full mt-8 sm:mt-12 pb-4'>
      <div className='text-center px-3 pt-4 pb-8'>
        <div className='text-sm sm:text-base text-slate-700 mb-4'>
          {t.common.poweredBy}{' '}
          <a
            href='https://replicate.com/'
            target='_blank'
            rel='noreferrer'
            className='font-bold transition hover:text-[#3290EE]'
          >
            Replicate{' '}
          </a>
          {t.common.and}{' '}
          <a
            href='https://www.bytescale.com/'
            target='_blank'
            rel='noreferrer'
            className='font-bold transition hover:text-[#3290EE]'
          >
            Bytescale{' '} 
          </a>
          {language === 'zh' ? '提供技术支持。' : 'provide technical support.'} {t.common.createdBy}{' '}
          <a
            href='https://www.twitter.com/nutlope'
            target='_blank'
            rel='noreferrer'
            className='font-bold transition hover:text-[#3290EE]'
          >
            Hassan
          </a>{' '}
          {t.common.and} {' '}
          <a
            href='https://www.sweetstar.ai/'
            target='_blank'
            rel='noreferrer'
            className='font-bold transition hover:text-[#3290EE]'
          >
            {language === 'zh' ? '蓝星工作室' : 'Blue Star Studio'}
          </a>
          {' '}{language === 'zh' ? '创作。' : '.'}
        </div>
        
        {/* Legal Links */}
        <div className='flex flex-wrap justify-center items-center gap-3 sm:gap-4 mb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400'>
          <Link href='/privacy-policy' className='hover:text-slate-900 dark:hover:text-slate-100 transition-colors'>
            {t.legal.privacyPolicy.title}
          </Link>
          <span className='text-slate-400'>|</span>
          <Link href='/terms-of-service' className='hover:text-slate-900 dark:hover:text-slate-100 transition-colors'>
            {t.legal.termsOfService.title}
          </Link>
          <span className='text-slate-400'>|</span>
          <Link href='/refund-policy' className='hover:text-slate-900 dark:hover:text-slate-100 transition-colors'>
            {t.legal.refundPolicy.title}
          </Link>
          <span className='text-slate-400'>|</span>
          <Link href='/cookie-policy' className='hover:text-slate-900 dark:hover:text-slate-100 transition-colors'>
            {t.legal.cookiePolicy.title}
          </Link>
          <span className='text-slate-400'>|</span>
          <Link href='/copyright' className='hover:text-slate-900 dark:hover:text-slate-100 transition-colors'>
            {t.legal.copyright.title}
          </Link>
          <span className='text-slate-400'>|</span>
          <Link href='/contact' className='hover:text-slate-900 dark:hover:text-slate-100 transition-colors'>
            {t.legal.contact.title}
          </Link>
        </div>
        
        <div className='flex justify-center items-center gap-4'>
      <Link
        href='https://www.sweetstar.ai/'
        className='group'
            aria-label={t.common.contactUs}
      >
      <img
        src='/BlueStarLogo.jpg'
        width={24}
        height={24}
              alt={language === 'zh' ? '蓝星工作室' : 'Blue Star Studio'}
              className='group-hover:scale-110 transition-transform rounded-full'
      />
    </Link>
        </div>
      </div>
    </footer>
  );
}
