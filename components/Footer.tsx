import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='text-center h-16 sm:h-20 w-full sm:pt-2 pt-4 border-t mt-5 flex sm:flex-row flex-col justify-between items-center px-3 space-y-3 sm:mb-0 mb-3'>
      <div>
          由{' '}
          <a
            href='https://replicate.com/'
            target='_blank'
            className='font-bold transition hover:text-black/50'
          >
            Replicate{' '}
          </a>
          和{' '}
          <a
            href='https://www.bytescale.com/'
            target='_blank'
            className='font-bold transition hover:text-black/50'
          >
            Bytescale{' '} 
          </a>
          提供技术支持。由{' '}
          <a
            href='https://www.twitter.com/nutlope'
            target='_blank'
            className='font-bold transition hover:text-black/50'
          >
            Hassan
          </a>{' '}
          和 {' '}
          <a
            href='https://www.sweetstar.ai/'
            target='_blank'
            className='font-bold transition hover:text-black/50'
          >
            蓝星工作室
          </a>
          {' '}创作。
        </div>
      <div className='flex space-x-4 pb-4 sm:pb-0'>
        
      <a
        target='_blank'
        className='font-bold transition hover:text-black/50'
        >
          蓝星工作室
        </a>
      

      <Link
        href='https://www.sweetstar.ai/'
        className='group'
        aria-label='联系我们'
      >
      <img
        src='/BlueStarLogo.jpg'
        width={24}
        height={24}
        alt=''
        className='group-hover:scale-110 transition-transform'
      />
    </Link>

        
      </div>
    </footer>
  );
}
