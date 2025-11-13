import Link from 'next/link';

export default function Header() {
  return (
    <header className='flex justify-between items-center w-full mt-5 border-b-2 pb-7 sm:px-4 px-2'>
      <Link href='/' className='flex space-x-2'>
        <img
          alt='header text'
          src='/imageIcon.png'
          className='sm:w-10 sm:h-10 w-7 h-7'
          width={20}
          height={20}
        />
        <h1 className='sm:text-3xl text-xl font-bold ml-2 tracking-tight'>
          照片修复工具
        </h1>
      </Link>
      <div className='flex space-x-6'>
        <Link
          href='/'
          className='border-r border-gray-300 pr-4 space-x-2 hover:text-blue-400 transition hidden sm:flex'
        >
          <p className='font-medium text-base'>首页</p>
        </Link>
        <Link
          href='/restore'
          className='border-r border-gray-300 pr-4 space-x-2 hover:text-blue-400 transition hidden sm:flex'
        >
          <p className='font-medium text-base'>修复</p>
        </Link>
        <Link
          href='/passport-photo'
          className='border-gray-300 pr-4 space-x-2 hover:text-blue-400 transition hidden sm:flex'
        >
          <p className='font-medium text-base'>证件照</p>
        </Link>
      </div>
    </header>
  );
}
