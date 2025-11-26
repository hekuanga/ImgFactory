import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useState, useEffect } from 'react';
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
import { useTranslation } from '../hooks/useTranslation';
import { getMaxFileSize, formatFileSize } from '../constants/upload';

const Home: NextPage = () => {
  const { t, language } = useTranslation();
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [restoredLoaded, setRestoredLoaded] = useState<boolean>(false);
  const [sideBySide, setSideBySide] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('replicate'); // 默认使用Replicate
  const [usedModel, setUsedModel] = useState<string | null>(null);
  const [remainingGenerations, setRemainingGenerations] = useState<number>(2);
  const [modelSwitchMessage, setModelSwitchMessage] = useState<string | null>(null);

  // 组件挂载时加载剩余次数
  useEffect(() => {
    loadRemainingGenerations();
  }, []);

  // 加载剩余生成次数
  const loadRemainingGenerations = async () => {
    try {
      const res = await fetch('/api/remaining');
      const data = await res.json();
      setRemainingGenerations(data.remainingGenerations);
    } catch (error) {
      console.error('加载剩余次数失败:', error);
    }
  };

  const hasApiKey = !!process.env.NEXT_PUBLIC_UPLOAD_API_KEY;
  const maxFileSize = getMaxFileSize(hasApiKey);

  const options: UploadWidgetConfig = {
    apiKey: hasApiKey
      ? (process.env.NEXT_PUBLIC_UPLOAD_API_KEY as string)
      : 'free',
    maxFileCount: 1,
    maxFileSizeBytes: maxFileSize, // 设置组件支持的最大文件大小
    mimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    editor: { images: { crop: false } },
    styles: { 
      colors: { primary: '#000' },
      fonts: { base: 'system-ui, -apple-system, sans-serif' }
    },
    locale: {
      'orDragDrop': '或拖拽图片到此处',
      'upload': '上传图片',
      'browse': '浏览文件'
    },
    onPreUpload: async (
      file: File
    ): Promise<UploadWidgetOnPreUploadResult | undefined> => {
      // 检查文件大小
      if (file.size > maxFileSize) {
        const maxSizeStr = formatFileSize(maxFileSize);
        const errorMsg = language === 'zh' 
          ? `图片大小不能超过${maxSizeStr}。请压缩图片或创建 Bytescale 账户以上传更大的文件。`
          : `Image size cannot exceed ${maxSizeStr}. Please compress the image or create a Bytescale account to upload larger files.`;
        // 使用 setTimeout 确保错误消息在组件更新后显示
        setTimeout(() => {
          setError(errorMsg);
        }, 100);
        return { errorMessage: errorMsg };
      }
      // 清除之前的错误
      setTimeout(() => {
        setError(null);
      }, 100);
      return undefined;
    },
  };

  const UploadDropZone = () => (
    <div className='w-full max-w-4xl'>
      {/* 上传组件容器 - 更突出的样式 */}
      <div className='relative bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border-4 border-[#E8DEBB] dark:border-slate-700 transition-colors duration-300'>
        {/* 装饰效果 */}
        <div className='absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#FFF8E0]/20 dark:from-slate-700/20 to-transparent pointer-events-none'></div>
        
        {/* 中文提示 */}
        <div className='text-center mb-4 relative z-10'>
          <p className='text-base sm:text-lg text-slate-700 dark:text-slate-300 font-medium mb-2 transition-colors duration-300'>
            {t.restore.uploadPhoto}
          </p>
          <p className='text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300'>
            {language === 'zh' ? '支持 JPG、PNG 格式，或直接拖拽图片到下方区域' : 'Supports JPG, PNG formats, or drag and drop images below'}
          </p>
        </div>
        
        {/* 上传组件 */}
        <div className='relative z-10'>
          <UploadDropzone
            options={options}
            onUpdate={({ uploadedFiles }) => {
              if (uploadedFiles.length !== 0) {
                // 清除之前的错误
                setError(null);
                
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
                // 恢复自动修复功能
                generatePhoto(imageUrl);
              }
            }}
            width='100%'
            height='280px'
          />
          
          {/* 在上传组件下方显示错误提示 */}
          {error && (
            <div
              className='bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl mt-4 shadow-lg'
              role='alert'
            >
              <div className='flex items-center gap-2 mb-1'>
                <svg className='w-5 h-5 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                </svg>
                <span className='font-bold text-sm'>{language === 'zh' ? '上传错误' : 'Upload Error'}</span>
              </div>
              <div className='text-sm whitespace-pre-line ml-7'>
                {error}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  async function generatePhoto(fileUrl: string) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(true);
    setError(null);
    setModelSwitchMessage(null);

    try {
      // 调用API，传递所选模型
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageUrl: fileUrl,
          model: selectedModel // 传递所选模型
        }),
      });

      let response = await res.json();
      if (res.status !== 200) {
        // 直接使用响应内容作为错误消息，因为API返回的是错误字符串
        setError(response || '照片修复失败，请稍后再试。');
      } else {
        // 检查响应类型
        if (typeof response === 'string') {
          // 如果是字符串，直接作为图片URL
          setRestoredImage(response);
        } else if (response && typeof response === 'object') {
          // 如果是对象，提取图片URL和使用的模型
          setRestoredImage(response.imageUrl);
          if (response.usedModel) {
            setUsedModel(response.usedModel);
          }
          // 检查是否有模型切换信息
          if (response.modelSwitchInfo) {
            setModelSwitchMessage(response.modelSwitchInfo);
          }
        }
      }
    } catch (error) {
      // 提供更详细的捕获异常信息
      console.error('生成照片时发生错误:', error);
      setError('服务器通信失败，请检查网络连接或稍后再试。');
    } finally {
      setLoading(false);
      loadRemainingGenerations(); // 重新加载剩余次数
    }
  }

  return (
    <div className='flex max-w-6xl mx-auto flex-col items-center justify-start py-2 min-h-screen bg-[#F7F4E9] dark:bg-slate-900 transition-colors duration-300'>
      <Head>
        <title>{t.restore.title} - {t.nav.studio}</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-start text-center px-4 pt-16 pb-4'>
        {/* 大图预览模态框 */}
        <div 
          id="preview-modal"
          className="hidden fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              document.getElementById('preview-modal')?.classList.add('hidden');
            }
          }}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            onClick={() => document.getElementById('preview-modal')?.classList.add('hidden')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <img 
              src={restoredImage || ''} 
              alt="大图预览" 
              className="max-w-full max-h-[80vh] object-contain"
            />
            <button 
              className="mt-6 bg-white dark:bg-slate-800 text-black dark:text-white rounded-lg px-6 py-3 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                if (restoredImage) {
                  downloadPhoto(restoredImage, appendNewToName(photoName || 'restored-photo'));
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {t.restore.download}
            </button>
          </div>
        </div>
        
        <h1 className='mx-auto max-w-5xl font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-normal text-slate-900 dark:text-slate-100 mb-3 transition-colors duration-300 leading-tight px-4'>
          {t.restore.title}
        </h1>
        <p className='mx-auto max-w-3xl text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 mb-6 transition-colors duration-300 px-4'>
          {t.home.subtitle}
        </p>
        
        {/* 模型选择区域 - 始终显示，不依赖于是否上传照片 */}
        <div className='w-full max-w-md mb-6'>
          <div className='bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-[#E8DEBB] dark:border-slate-700 transition-colors duration-300'>
            <h3 className='text-lg font-medium mb-4 text-slate-700 dark:text-slate-300 transition-colors duration-300'>{t.restore.selectModel}</h3>
            <div className='flex flex-wrap gap-3 justify-center mb-4'>
              <button
                className={`px-4 py-2 rounded-lg font-medium transition ${selectedModel === 'replicate' 
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-md' 
                  : 'bg-[#F7F4E9] dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-[#E8DEBB] dark:border-slate-600 hover:bg-[#FCF7E3] dark:hover:bg-slate-600'}`}
                onClick={() => setSelectedModel('replicate')}
                disabled={loading}
                title="Replicate - 开源模型，响应速度较快"
              >
                Replicate
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium transition ${selectedModel === 'ark' 
                  ? 'bg-black text-white shadow-md' 
                  : 'bg-[#F7F4E9] text-slate-700 border border-[#E8DEBB] hover:bg-[#FCF7E3]'}`}
                onClick={() => setSelectedModel('ark')}
                disabled={loading}
                title="方舟SDK - 豆包官方AI模型，细节还原更自然"
              >
                方舟SDK
              </button>
            </div>
            <p className='text-xs text-slate-600 text-left leading-relaxed'>
              * 方舟SDK: 豆包官方AI模型，色彩还原度高，细节更自然<br/>
              * Replicate: 开源模型，响应速度较快<br/>
              * 当首选模型调用失败时，系统会自动尝试备选模型
            </p>
          </div>
        </div>
        
        {/* 模型切换信息提示 */}
        {modelSwitchMessage && (
          <div className="bg-blue-50 border-2 border-blue-200 text-blue-700 px-4 py-3 rounded-xl mb-6 max-w-md shadow-sm">
            <strong>提示：</strong> {modelSwitchMessage}
          </div>
        )}
        
        {/* 使用的模型信息 */}
        {usedModel && (
          <div className="mt-4 text-sm text-gray-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-[#E8DEBB] dark:border-slate-600 inline-block transition-colors duration-300">
            使用模型: <span className="font-medium">{usedModel}</span>
          </div>
        )}
        
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
            <div className='w-full max-w-4xl'>
              <div className='bg-[#F7F4E9] dark:bg-slate-800 rounded-3xl sm:rounded-[40px] p-4 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border-4 border-[#E8DEBB] dark:border-slate-700 relative overflow-hidden transition-colors duration-300'>
                <div className='absolute inset-0 opacity-30 pointer-events-none'>
                  <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FFF8E0] dark:from-slate-700/30 to-transparent'></div>
                </div>
                <div className='relative flex flex-col sm:flex-row gap-4 sm:gap-8'>
                  <div className='flex-1'>
                    <h2 className='mb-3 sm:mb-4 font-medium text-base sm:text-lg text-slate-700 dark:text-slate-300 transition-colors duration-300'>{t.restore.originalPhoto}</h2>
                    <div className='bg-white dark:bg-slate-700 rounded-2xl sm:rounded-3xl p-2 sm:p-4 shadow-inner border-2 border-[#E8DEBB] dark:border-slate-600 overflow-hidden transition-colors duration-300'>
                      <Image
                        alt='修复前'
                        src={originalPhoto}
                        className='w-full h-auto rounded-xl'
                        width={475}
                        height={475}
                      />
                    </div>
                  </div>
                  <div className='hidden sm:block w-px bg-[#CFC3A7] dark:bg-slate-600 self-stretch my-4 transition-colors duration-300'></div>
                  <div className='sm:hidden w-full h-px bg-[#CFC3A7] dark:bg-slate-600 my-2 transition-colors duration-300'></div>
                  <div className='flex-1'>
                    <h2 className='mb-3 sm:mb-4 font-medium text-base sm:text-lg text-slate-700 dark:text-slate-300 transition-colors duration-300'>{t.restore.restoredPhoto}</h2>
                    <div className='bg-white dark:bg-slate-700 rounded-2xl sm:rounded-3xl p-2 sm:p-4 shadow-inner border-2 border-[#E8DEBB] dark:border-slate-600 min-h-[300px] sm:min-h-[400px] flex items-center justify-center transition-colors duration-300'>
                      {loading ? (
                        <LoadingDots color='#666' style='large' />
                      ) : (
                        <div className='text-slate-400 dark:text-slate-500 text-sm sm:text-base transition-colors duration-300'>{t.restore.loading}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {restoredImage && originalPhoto && !sideBySide && (
            <div className='w-full max-w-4xl'>
              <div className='bg-[#F7F4E9] rounded-3xl sm:rounded-[40px] p-4 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-4 border-[#E8DEBB] relative overflow-hidden'>
                {/* 内部装饰效果 */}
                <div className='absolute inset-0 opacity-30 pointer-events-none'>
                  <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FFF8E0] dark:from-slate-700/30 to-transparent'></div>
                </div>
                
                <div className='relative flex flex-col sm:flex-row gap-4 sm:gap-8'>
                  {/* 修复前 */}
                  <div className='flex-1'>
                    <h2 className='mb-3 sm:mb-4 font-medium text-base sm:text-lg text-slate-700 dark:text-slate-300 transition-colors duration-300'>{t.restore.originalPhoto}</h2>
                    <div className='bg-white dark:bg-slate-700 rounded-2xl sm:rounded-3xl p-2 sm:p-4 shadow-inner border-2 border-[#E8DEBB] dark:border-slate-600 overflow-hidden transition-colors duration-300'>
                      <Image
                        alt='修复前照片'
                        src={originalPhoto}
                        className='w-full h-auto rounded-xl'
                        width={600}
                        height={600}
                      />
                    </div>
                  </div>

                  {/* 分隔线 */}
                  <div className='hidden sm:block w-px bg-[#CFC3A7] dark:bg-slate-600 self-stretch my-4 transition-colors duration-300'></div>
                  <div className='sm:hidden w-full h-px bg-[#CFC3A7] dark:bg-slate-600 my-2 transition-colors duration-300'></div>

                  {/* 修复后 */}
                  <div className='flex-1'>
                    <h2 className='mb-3 sm:mb-4 font-medium text-base sm:text-lg text-slate-700 dark:text-slate-300 transition-colors duration-300'>{t.restore.restoredPhoto}</h2>
                    <div
                      onClick={() => document.getElementById('preview-modal')?.classList.remove('hidden')}
                      className='bg-white dark:bg-slate-700 rounded-2xl sm:rounded-3xl p-2 sm:p-4 shadow-inner border-2 border-[#E8DEBB] dark:border-slate-600 overflow-hidden cursor-zoom-in relative group transition-colors duration-300'
                    >
                      <Image
                        alt='修复后'
                        src={restoredImage}
                        className='w-full h-auto rounded-xl transition-transform group-hover:scale-[1.02]'
                        width={600}
                        height={600}
                        onLoadingComplete={() => setRestoredLoaded(true)}
                      />
                      <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 flex items-center justify-center transition-all duration-200 rounded-xl'>
                        <svg className='w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {loading && (
            <div className='mt-8'>
              <div className='bg-[#F7F4E9] dark:bg-slate-800 rounded-2xl px-6 py-4 border-2 border-[#E8DEBB] dark:border-slate-700 inline-block transition-colors duration-300'>
                <LoadingDots color='#666' style='large' />
                <p className='text-sm text-slate-600 dark:text-slate-400 mt-2 transition-colors duration-300'>{t.restore.loading}</p>
              </div>
            </div>
          )}
          {error && (
            <div
              className='bg-red-50 border-2 border-red-300 text-red-700 px-6 py-4 rounded-xl mt-8 max-w-[575px] shadow-lg'
              role='alert'
            >
              <div className='flex items-center gap-2 mb-2'>
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                </svg>
                <span className='font-bold'>错误</span>
              </div>
              <div className='text-sm whitespace-pre-line'>
                {error}
              </div>
            </div>
          )}
          <div className='flex flex-wrap gap-3 justify-center mt-6'>
            {originalPhoto && !loading && (
              <button
                onClick={() => {
                  setOriginalPhoto(null);
                  setRestoredImage(null);
                  setRestoredLoaded(false);
                  setError(null);
                  setUsedModel(null);
                  setModelSwitchMessage(null);
                }}
                className='bg-black rounded-xl text-white font-medium px-6 py-3 hover:bg-black/80 transition shadow-lg'
              >
                上传新照片
              </button>
            )}
            {restoredLoaded && originalPhoto && (
              <button
                onClick={async () => {
                  // 重置修复结果
                  setRestoredImage(null);
                  setRestoredLoaded(false);
                  setError(null);
                  setUsedModel(null);
                  setModelSwitchMessage(null);
                  
                  // 等待UI更新后再重新生成
                  await new Promise(resolve => setTimeout(resolve, 200));
                  
                  // 重新生成照片
                  if (originalPhoto) {
                    await generatePhoto(originalPhoto);
                  }
                }}
                disabled={loading}
                className={`bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-[#E8DEBB] dark:border-slate-600 font-medium px-6 py-3 hover:bg-[#F7F4E9] dark:hover:bg-slate-700 transition shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? t.restore.loading : t.restore.regenerate}
              </button>
            )}
            {restoredLoaded && (
              <button
                onClick={() => {
                  downloadPhoto(restoredImage!, appendNewToName(photoName!));
                }}
                className='bg-white rounded-xl text-slate-700 border-2 border-[#E8DEBB] font-medium px-6 py-3 hover:bg-[#F7F4E9] transition shadow-lg'
              >
                {t.restore.download}
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
