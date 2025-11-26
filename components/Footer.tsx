import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='relative w-full mt-8 sm:mt-12 pb-4'>
      <div className='text-center px-3 pt-4 pb-8'>
        <div className='text-sm sm:text-base text-slate-700 mb-4'>
          由{' '}
          <a
            href='https://replicate.com/'
            target='_blank'
            rel='noreferrer'
            className='font-bold transition hover:text-[#3290EE]'
          >
            Replicate{' '}
          </a>
          和{' '}
          <a
            href='https://www.bytescale.com/'
            target='_blank'
            rel='noreferrer'
            className='font-bold transition hover:text-[#3290EE]'
          >
            Bytescale{' '} 
          </a>
          提供技术支持。由{' '}
          <a
            href='https://www.twitter.com/nutlope'
            target='_blank'
            rel='noreferrer'
            className='font-bold transition hover:text-[#3290EE]'
          >
            Hassan
          </a>{' '}
          和 {' '}
          <a
            href='https://www.sweetstar.ai/'
            target='_blank'
            rel='noreferrer'
            className='font-bold transition hover:text-[#3290EE]'
          >
            蓝星工作室
          </a>
          {' '}创作。
        </div>
        <div className='flex justify-center items-center gap-4'>
          <Link
            href='https://www.sweetstar.ai/'
            className='group'
            aria-label='联系我们'
          >
            <img
              src='/BlueStarLogo.jpg'
              width={24}
              height={24}
              alt='蓝星工作室'
              className='group-hover:scale-110 transition-transform rounded-full'
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}
