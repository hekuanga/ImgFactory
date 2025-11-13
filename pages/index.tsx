import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Footer from '../components/Footer';
import Header from '../components/Header';
import SquigglyLines from '../components/SquigglyLines';
import { Testimonials } from '../components/Testimonials';

const Home: NextPage = () => {
  return (
    <div className='flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen'>
      <Head>
        <title>面部照片修复工具</title>
      </Head>
      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-20'>
        <a
          href='https://twitter.com/nutlope/status/1704894145003741611'
          target='_blank'
          rel='noreferrer'
          className='border rounded-2xl py-1 px-4 text-slate-500 text-sm mb-5 hover:scale-105 transition duration-300 ease-in-out'
        >
          已有超过 <span className='font-semibold'>470,000</span> 位用户使用
        </a>
        <h1 className='mx-auto max-w-4xl font-display text-5xl font-bold tracking-normal text-slate-900 sm:text-7xl'>
          为每个人{' '}
          <span className='relative whitespace-nowrap text-[#3290EE]'>
            <SquigglyLines />
            <span className='relative'>使用AI</span>
          </span>{' '}
          修复旧照片
        </h1>

        <p className='mx-auto mt-12 max-w-xl text-lg text-slate-700 leading-7'>
          有旧的模糊面部照片？让我们的AI修复它们，让那些珍贵的回忆得以保留。完全免费 - 立即修复您的照片。
        </p>
        <div className='flex justify-center space-x-4'>
          <Link
            className='bg-black rounded-xl text-white font-medium px-4 py-3 sm:mt-10 mt-8 hover:bg-black/80'
            href='/restore'
          >
            修复您的照片
          </Link>
          <Link
            className='bg-[#3290EE] rounded-xl text-white font-medium px-4 py-3 sm:mt-10 mt-8 hover:bg-[#3290EE]/80'
            href='/passport-photo'
          >
            生成证件照
          </Link>
        </div>
        <div className='flex justify-between items-center w-full flex-col sm:mt-10 mt-6'>
          <div className='flex flex-col space-y-10 mt-4 mb-16'>
            <div className='flex sm:space-x-2 sm:flex-row flex-col'>
              <div>
                <h2 className='mb-1 font-medium text-lg'>修复前</h2>
                <img
                  alt='我兄弟的原照片'
                  src='/michael.jpg'
                  className='w-96 h-96 rounded-2xl'
                  width={400}
                  height={400}
                />
              </div>
              <div className='sm:mt-0 mt-8'>
                <h2 className='mb-1 font-medium text-lg'>修复后</h2>
                <img
                  alt='我兄弟修复后的照片'
                  width={400}
                  height={400}
                  src='/michael-new.jpg'
                  className='w-96 h-96 rounded-2xl sm:mt-0 mt-2'
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Home;
