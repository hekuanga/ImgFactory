import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import { UrlBuilder } from '@bytescale/sdk';
import {
  UploadWidgetConfig,
  UploadWidgetOnPreUploadResult,
} from '@bytescale/upload-widget';
import { UploadDropzone } from '@bytescale/upload-widget-react';
import { CompareSlider } from '../components/CompareSlider';
import Footer from '../components/Footer';
import Header from '../components/Header';
import LoadingDots from '../components/LoadingDots';
import Toggle from '../components/Toggle';
import appendNewToName from '../utils/appendNewToName';
import downloadPhoto from '../utils/downloadPhoto';

const Home: NextPage = () => {
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [restoredLoaded, setRestoredLoaded] = useState<boolean>(false);
  const [sideBySide, setSideBySide] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);

  const options: UploadWidgetConfig = {
    apiKey: !!process.env.NEXT_PUBLIC_UPLOAD_API_KEY
      ? process.env.NEXT_PUBLIC_UPLOAD_API_KEY
      : 'free',
    maxFileCount: 1,
    mimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    editor: { images: { crop: false } },
    styles: { colors: { primary: '#000' } },
    onPreUpload: async (
      file: File
    ): Promise<UploadWidgetOnPreUploadResult | undefined> => {
      // 移除NSFW检查，直接允许上传
      return undefined;
    },
  };

  const UploadDropZone = () => (
    <UploadDropzone
      options={options}
      onUpdate={({ uploadedFiles }) => {
        if (uploadedFiles.length !== 0) {
          const image = uploadedFiles[0];
          const imageName = image.originalFile.originalFileName;
          // 使用原始文件URL，确保API可以正确识别图片格式
          const imageUrl = UrlBuilder.url({
            accountId: image.accountId,
            filePath: image.filePath,
            // 移除 transformation 选项，使用原始文件
          });
          setPhotoName(imageName);
          setOriginalPhoto(imageUrl);
          generatePhoto(imageUrl);
        }
      }}
      width='670px'
      height='250px'
    />
  );

  async function generatePhoto(fileUrl: string) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(true);

    try {
      // Direct call to generate API without checking remaining API
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: fileUrl }),
      });

      let response = await res.json();
      if (res.status !== 200) {
        // 直接使用响应内容作为错误消息，因为API返回的是错误字符串
        setError(response || '照片修复失败，请稍后再试。');
      } else {
        setRestoredImage(response);
      }
    } catch (error) {
      // 提供更详细的捕获异常信息
      console.error('生成照片时发生错误:', error);
      setError('服务器通信失败，请检查网络连接或稍后再试。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen'>
      <Head>
        <title>修复照片</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-4 sm:mb-0 mb-8'>
        
        <h1 className='mx-auto max-w-4xl font-display text-4xl font-bold tracking-normal text-slate-900 sm:text-6xl mb-5'>
          请上传您想要修复的照片
        </h1>
        <div className='flex justify-between items-center w-full flex-col mt-4'>
          <Toggle
            className={`${restoredLoaded ? 'visible mb-6' : 'invisible'}`}
            sideBySide={sideBySide}
            setSideBySide={(newVal) => setSideBySide(newVal)}
          />
          {restoredLoaded && sideBySide && (
            <CompareSlider
              original={originalPhoto!}
              restored={restoredImage!}
            />
          )}
          {!originalPhoto && <UploadDropZone />}
          {originalPhoto && !restoredImage && (
            <Image
              alt='修复前'
              src={originalPhoto}
              className='rounded-2xl'
              width={475}
              height={475}
            />
          )}
          {restoredImage && originalPhoto && !sideBySide && (
            <div className='flex sm:space-x-4 sm:flex-row flex-col'>
              <div>
                <h2 className='mb-1 font-medium text-lg'>修复前</h2>
                <Image
                  alt='修复前照片'
                  src={originalPhoto}
                  className='rounded-2xl relative'
                  width={600}
                  height={600}
                />
              </div>
              <div className='sm:mt-0 mt-8'>
                <h2 className='mb-1 font-medium text-lg'>修复后照片</h2>
                <a href={restoredImage} target='_blank' rel='noreferrer'>
                  <Image
                    alt='修复后'
                    src={restoredImage}
                    className='rounded-2xl relative sm:mt-0 mt-2 cursor-zoom-in'
                    width={600}
                    height={600}
                    onLoadingComplete={() => setRestoredLoaded(true)}
                  />
                </a>
              </div>
            </div>
          )}
          {loading && (
            <button
              disabled
              className='bg-black rounded-full text-white font-medium px-4 pt-2 pb-3 mt-8 hover:bg-black/80 w-40'
            >
              <span className='pt-4'>
                <LoadingDots color='white' style='large' />
              </span>
            </button>
          )}
          {error && (
            <div
              className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mt-8 max-w-[575px]'
              role='alert'
            >
              <div className='bg-red-500 text-white font-bold rounded-t px-4 py-2'>
                错误
              </div>
              <div className='border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700'>
                {error}
              </div>
            </div>
          )}
          <div className='flex space-x-2 justify-center'>
            {originalPhoto && !loading && (
              <button
                onClick={() => {
                  setOriginalPhoto(null);
                  setRestoredImage(null);
                  setRestoredLoaded(false);
                  setError(null);
                }}
                className='bg-black rounded-full text-white font-medium px-4 py-2 mt-8 hover:bg-black/80 transition'
              >
                上传新照片
              </button>
            )}
            {restoredLoaded && (
              <button
                onClick={() => {
                  downloadPhoto(restoredImage!, appendNewToName(photoName!));
                }}
                className='bg-white rounded-full text-black border font-medium px-4 py-2 mt-8 hover:bg-gray-100 transition'
              >
                下载修复后的照片
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
