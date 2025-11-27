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

import Footer from '../components/Footer';
import Header from '../components/Header';
import LoadingDots from '../components/LoadingDots';
import appendNewToName from '../utils/appendNewToName';
import downloadPhoto from '../utils/downloadPhoto';
import { useTranslation } from '../hooks/useTranslation';
import { getMaxFileSize, formatFileSize } from '../constants/upload';

const PassportPhoto: NextPage = () => {
  const { t, language } = useTranslation();
  // 状态管理
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null); // 添加文件对象状态
  const [generatedPhoto, setGeneratedPhoto] = useState<string | null>(null);
  const [usedModel, setUsedModel] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [photoLoaded, setPhotoLoaded] = useState<boolean>(false);
  const [modelSwitchMessage, setModelSwitchMessage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [remainingGenerations, setRemainingGenerations] = useState<number>(2);
  const [resetHours, setResetHours] = useState<number>(0);
  const [resetMinutes, setResetMinutes] = useState<number>(0);
  
  // 模型选择状态 - 默认选择方舟SDK
  const [selectedModel, setSelectedModel] = useState<string>('ark'); // 'ark' 或 'replicate'

  // 证件照参数
  const [size, setSize] = useState<string>('1寸');
  const [backgroundColor, setBackgroundColor] = useState<string>('白');
  const [clothingStyle, setClothingStyle] = useState<string>('正装衬衫');

  // Bytescale 上传配置 - 与修复页面相同
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
      fontFamilies: { base: 'system-ui, -apple-system, sans-serif' }
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
  
  // 自定义参数状态
  const [showCustomSizeModal, setShowCustomSizeModal] = useState<boolean>(false);
  const [showCustomColorPicker, setShowCustomColorPicker] = useState<boolean>(false);
  const [customWidth, setCustomWidth] = useState<string>('');
  const [customHeight, setCustomHeight] = useState<string>('');
  const [customColor, setCustomColor] = useState<string>('#FF0000'); // 默认红色

  // 加载剩余次数
  const loadRemainingGenerations = async () => {
    try {
      const res = await fetch('/api/remaining');
      const data = await res.json();
      setRemainingGenerations(data.remainingGenerations);
      setResetHours(data.hours);
      setResetMinutes(data.minutes);
    } catch (error) {
      console.error('加载剩余次数失败:', error);
    }
  };

  // 组件挂载时加载剩余次数
  useEffect(() => {
    loadRemainingGenerations();
  }, []);

  // 从 URL 下载图片并转换为 File 对象
  const urlToFile = async (url: string, filename: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };

  // Bytescale 上传组件 - 与修复页面相同
  const UploadDropZone = () => (
    <div className='w-full max-w-4xl'>
      {/* 上传提示 */}
      <div className='text-center mb-4'>
        <p className='text-base sm:text-lg text-slate-700 font-medium mb-2'>
          {t.common.uploadInstruction}
        </p>
        <p className='text-sm text-slate-500'>
          {t.common.uploadFormat}
        </p>
      </div>
      
      {/* 上传组件容器 - 更突出的样式 */}
      <div className='relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.15)] border-4 border-[#E8DEBB]'>
        {/* 装饰效果 */}
        <div className='absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#FFF8E0]/20 to-transparent pointer-events-none'></div>
        
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
                // 使用原始文件URL，不使用thumbnail转换，确保方舟SDK可以正确识别图片格式
                const imageUrl = UrlBuilder.url({
                  accountId: image.accountId,
                  filePath: image.filePath,
                  // 移除 transformation 选项，使用原始文件
                });
                
                setPhotoName(imageName);
                setOriginalPhoto(imageUrl);
                // 直接使用 URL，不再下载文件
                // 将 URL 存储到 photoFile 状态中（虽然名字是 photoFile，但我们可以存储 URL）
                setPhotoFile(null); // 清空文件对象，表示使用 URL
                console.log('图片已上传到 Bytescale，URL:', imageUrl.substring(0, 100) + '...');
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

  // 创建简单的文件上传区域，不依赖外部上传服务（保留作为备用）
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    console.log('选择文件:', file.name, file.size, file.type);
    
    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('请上传JPG或PNG格式的图片');
      return;
    }
    
    // 检查文件大小
    if (file.size > maxFileSize) {
      const maxSizeStr = formatFileSize(maxFileSize);
      const errorMsg = language === 'zh' 
        ? `图片大小不能超过${maxSizeStr}`
        : `Image size cannot exceed ${maxSizeStr}`;
      setError(errorMsg);
      return;
    }
    
    // 使用FileReader读取文件并进行处理
    // 检查是否在客户端环境中
    if (typeof window === 'undefined') {
      setError('请在浏览器中上传图片');
      return;
    }
    
    try {
      // 直接保存文件对象而不是DataURL
      setPhotoFile(file);
      setPhotoName(file.name);
      setGeneratedPhoto(null);
      setUsedModel(null);
      setPhotoLoaded(false);
      setError(null);
      
      // 同时读取为DataURL用于预览
      const previewReader = new window.FileReader();
      previewReader.onload = (e) => {
        try {
          const previewUrl = e.target?.result as string;
          if (previewUrl) {
            setOriginalPhoto(previewUrl);
            console.log('文件预览加载成功');
          }
        } catch (err) {
          console.error('预览生成失败:', err);
        }
      };
      previewReader.readAsDataURL(file);
      
      console.log('文件已准备好处理');
    } catch (err) {
      console.error('文件操作失败:', err);
      setError('无法处理文件，请重试');
    }
  };
  
  // 文件压缩函数 - 直接压缩文件对象，优化压缩策略以减少 DataURL 大小
  const compressFile = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      // 检查是否在客户端环境中
      if (typeof window === 'undefined') {
        resolve(file);
        return;
      }
      
      // 如果文件已经很小（小于 1MB），直接返回
      if (file.size <= 1 * 1024 * 1024) {
        resolve(file);
        return;
      }
      
      try {
        const reader = new window.FileReader();
        reader.onload = (event) => {
          const img = new window.Image();
          img.onload = () => {
            try {
              // 创建canvas进行压缩
              const canvas = document.createElement('canvas');
              
              // 计算压缩后的尺寸 - 降低最大尺寸以减少 DataURL 大小
              // 证件照不需要太高分辨率，800px 足够
              let maxDimension = 800;
              let width = img.width;
              let height = img.height;
              
              if (width > height && width > maxDimension) {
                height *= maxDimension / width;
                width = maxDimension;
              } else if (height > maxDimension) {
                width *= maxDimension / height;
                height = maxDimension;
              }
              
              canvas.width = width;
              canvas.height = height;
              
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                resolve(file);
                return;
              }
              
              // 使用更好的图片渲染质量
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, width, height);
              
              // 降低压缩质量以减少文件大小（0.7 是质量和大小的平衡点）
              let quality = 0.7;
              
              // 如果文件仍然很大，进一步降低质量
              if (file.size > 3 * 1024 * 1024) {
                quality = 0.6;
              }
              
              canvas.toBlob((blob) => {
                if (!blob) {
                  resolve(file);
                  return;
                }
                
                // 创建压缩后的文件，统一使用 JPEG 格式以减少大小
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                  type: 'image/jpeg'
                });
                
                console.log('文件压缩成功:', (file.size / 1024 / 1024).toFixed(2), 'MB ->', 
                            (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
                
                resolve(compressedFile);
              }, 'image/jpeg', quality);
            } catch (error) {
              console.error('压缩过程出错:', error);
              resolve(file);
            }
          };
          img.onerror = () => {
            console.error('图片加载失败');
            resolve(file);
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('压缩初始化失败:', error);
        resolve(file);
      }
    });
  };
  

  // 生成证件照
  async function generatePassportPhoto() {
    console.log('===== 开始生成证件照 =====');
    console.log('调用参数:');
    console.log('- 原始图像URL:', originalPhoto ? originalPhoto.substring(0, 50) + '...' : '无');
    console.log('- 尺寸:', size);
    console.log('- 背景颜色:', backgroundColor);
    console.log('- 服装风格:', clothingStyle);
    console.log('- 选择的模型:', selectedModel === 'ark' ? '方舟SDK' : 'Replicate');
    
    // 添加防御性检查，确保组件状态完整
    if (!originalPhoto) {
      setError('请先上传照片');
      console.error('生成失败: 未上传照片');
      return;
    }
    
    // 确保所有必要的状态都已设置
    if (!size || !backgroundColor || !clothingStyle) {
      const missingParams = [];
      if (!size) missingParams.push('尺寸');
      if (!backgroundColor) missingParams.push('背景颜色');
      if (!clothingStyle) missingParams.push('服装风格');
      console.error('缺少必要的配置参数:', missingParams.join(', '));
      setError(`配置不完整: 缺少${missingParams.join('、')}`);
      return;
    }

    if (remainingGenerations <= 0) {
      setError(`您的生成次数已用完，将在 ${resetHours} 小时和 ${resetMinutes} 分钟后重置`);
      return;
    }

    setLoading(true);
    setError(null);
    setModelSwitchMessage(null); // 清除之前的切换消息

    try {
      // 防御性检查
      if (!originalPhoto) {
        setError('请先上传图片');
        setLoading(false);
        return;
      }
      
      // 添加请求超时设置 - 增加到 120 秒，因为处理大图片需要更长时间
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒超时
      
      let res: Response;
      
      // 如果 photoFile 存在，说明是传统文件上传方式，使用 FormData
      // 如果 photoFile 为 null 但 originalPhoto 存在，说明是 Bytescale URL，直接发送 JSON
      if (photoFile) {
        // 传统文件上传方式（保留兼容性）
        console.log('使用文件上传方式');
        
        // 检查文件大小
        console.log('原始文件大小:', (photoFile.size / 1024 / 1024).toFixed(2), 'MB');
        
        if (photoFile.size > maxFileSize) {
          const maxSizeStr = formatFileSize(maxFileSize);
          const errorMsg = language === 'zh' 
            ? `图片大小不能超过${maxSizeStr}`
            : `Image size cannot exceed ${maxSizeStr}`;
          setError(errorMsg);
          setLoading(false);
          return;
        }
        
        // 压缩文件
        const processedFile = await compressFile(photoFile);
        
        // 使用FormData发送文件
        const formData = new FormData();
        formData.append('image', processedFile);
        formData.append('size', size);
        formData.append('backgroundColor', backgroundColor);
        formData.append('clothingStyle', clothingStyle);
        formData.append('skipClothing', 'false');
        formData.append('selectedModel', selectedModel);
        
        res = await fetch('/api/passport-photo', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
      } else {
        // Bytescale URL 方式（与照片修复页面一致）
        console.log('使用 URL 方式，直接发送 Bytescale URL');
        
        res = await fetch('/api/passport-photo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: originalPhoto,
            size: size,
            backgroundColor: backgroundColor,
            clothingStyle: clothingStyle,
            skipClothing: 'false',
            selectedModel: selectedModel
          }),
          signal: controller.signal
        });
      }
      
      clearTimeout(timeoutId);

      // 先读取响应文本，然后尝试解析为 JSON
      let response;
      
      try {
        const text = await res.text();
        
        // 尝试解析为 JSON
        try {
          response = JSON.parse(text);
        } catch (parseError) {
          // 如果解析失败，说明服务器返回的不是 JSON
          // 可能是 multer 或其他中间件的错误消息
          console.error('响应不是有效的 JSON:', text);
          const maxSizeStr = formatFileSize(maxFileSize);
          const fileSizeErrorMsg = language === 'zh' 
            ? `图片大小不能超过${maxSizeStr}`
            : `Image size cannot exceed ${maxSizeStr}`;
          response = { 
            error: text.includes('Body exceeded') || text.includes('LIMIT_FILE_SIZE')
              ? fileSizeErrorMsg
              : text || '服务器返回了非 JSON 格式的响应'
          };
        }
      } catch (error) {
        // 如果读取响应失败，返回错误
        console.error('读取响应失败:', error);
        setError('服务器通信失败: 无法读取服务器响应');
        setLoading(false);
        return;
      }
      
      if (res.status !== 200) {
        // 直接使用后端提供的详细错误消息，它已经包含了所有必要的提示
        // 对不同类型的错误进行特殊处理
        let errorMessage = response?.error || response || '服务器返回了错误';
        
        // 根据错误消息内容提供更友好的格式
        if (typeof errorMessage === 'string') {
          // 检查是否包含我们在后端添加的建议提示
          if (!errorMessage.includes('建议:')) {
            // 如果没有建议，添加统一的建议
            errorMessage += '\n建议: 请上传包含清晰人物的照片，确保光线充足，背景不要过于复杂。';
          }
          
          // 对于特定错误类型的额外提示
          if (errorMessage.includes('超时')) {
            errorMessage += '\n\n提示: 处理大图片可能需要较长时间，请尝试使用较小的图片文件。';
          } else if (errorMessage.includes('API错误')) {
            errorMessage += '\n\n提示: 这可能是服务器暂时不可用，请稍后再试。';
          }
        }
        
        setError(errorMessage);
      } else {
          // 解析JSON响应
          let parsedResponse;
          if (typeof response === 'string') {
            try {
              parsedResponse = JSON.parse(response);
            } catch {
              // 如果解析失败，假设响应直接是URL
              parsedResponse = { imageUrl: response };
            }
          } else {
            parsedResponse = response;
          }
          
          // 检查是否有模型切换信息
          if (parsedResponse.modelSwitchInfo) {
            console.log('模型切换信息:', parsedResponse.modelSwitchInfo);
            setModelSwitchMessage(parsedResponse.modelSwitchInfo);
          }
          
          // 检测是否是模型调用失败时返回的模拟响应或原始图片
          const isMockResponse = parsedResponse.usedModel && parsedResponse.usedModel.includes('Mock Response');
          const isOriginalImage = parsedResponse.imageUrl === originalPhoto;
          const hasMockData = parsedResponse.mockData !== undefined;
          
          // 如果是模拟响应或返回的是原始图片，显示错误提示
          if (isMockResponse || isOriginalImage || hasMockData) {
            console.log('检测到模型调用失败的模拟响应');
            setError('证件照生成失败：API服务暂时不可用或返回了无效结果。\n\n建议：\n- 请检查您的网络连接\n- 稍后再试\n- 尝试使用不同的照片');
            // 不更新generatedPhoto，保留之前的状态
          } else {
            // 正常响应，更新生成的照片
            setGeneratedPhoto(parsedResponse.imageUrl);
            setUsedModel(parsedResponse.usedModel || null);
            setPhotoLoaded(true);
            loadRemainingGenerations(); // 重新加载剩余次数
          }
        }
    } catch (error) {
      console.error('生成证件照时发生错误:', error);
      
      // 提供更具体的错误信息
      let errorMessage = '服务器通信失败';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = '请求超时，请检查网络连接或稍后再试';
        } else if (error.message.includes('Network')) {
          errorMessage = '网络连接失败，请检查您的网络设置';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = '服务器暂时无法访问，请稍后再试';
        } else {
          errorMessage += '：' + error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // 更换背景色
  async function changeBackgroundColor(newColor: string) {
    if (!originalPhoto || !generatedPhoto) return;
    
    setBackgroundColor(newColor);
    setLoading(true);
    setError(null);
    setModelSwitchMessage(null); // 清除之前的切换消息

    try {
      // 防御性检查
      if (!photoFile) {
        setError('请先上传图片');
        setLoading(false);
        return;
      }
      
      // 使用FormData而不是JSON发送文件
      const formData = new FormData();
      formData.append('image', photoFile);
      formData.append('size', size);
      formData.append('backgroundColor', newColor);
      formData.append('clothingStyle', clothingStyle);
      formData.append('skipClothing', 'true');
      formData.append('selectedModel', selectedModel);
      
      // 添加请求超时设置 - 增加到 120 秒，因为处理大图片需要更长时间
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒超时
      
      const res = await fetch('/api/passport-photo', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      let response = await res.json();
      if (res.status !== 200) {
        // 对更换背景时的错误进行特殊处理
        let errorMessage = response;
        if (typeof errorMessage === 'string') {
          if (!errorMessage.includes('建议:')) {
            errorMessage += '\n建议: 请确保图片质量良好，人物轮廓清晰。';
          }
        }
        setError(errorMessage);
      } else {
          // 解析JSON响应
          let parsedResponse;
          if (typeof response === 'string') {
            try {
              parsedResponse = JSON.parse(response);
            } catch {
              // 如果解析失败，假设响应直接是URL
              parsedResponse = { imageUrl: response };
            }
          } else {
            parsedResponse = response;
          }
          
          // 检查是否有模型切换信息
          if (parsedResponse.modelSwitchInfo) {
            console.log('模型切换信息:', parsedResponse.modelSwitchInfo);
            setModelSwitchMessage(parsedResponse.modelSwitchInfo);
          }
          
          // 检测是否是模型调用失败时返回的模拟响应或原始图片
          const isMockResponse = parsedResponse.usedModel && parsedResponse.usedModel.includes('Mock Response');
          const isOriginalImage = parsedResponse.imageUrl === originalPhoto;
          const hasMockData = parsedResponse.mockData !== undefined;
          
          // 如果是模拟响应或返回的是原始图片，显示错误提示
          if (isMockResponse || isOriginalImage || hasMockData) {
            console.log('更换背景色时检测到模型调用失败的模拟响应');
            setError('更换背景色失败：API服务暂时不可用或返回了无效结果。\n\n建议：\n- 请检查您的网络连接\n- 稍后再试\n- 确保图片质量良好');
            // 不更新generatedPhoto，保留之前的状态
          } else {
            // 正常响应，更新生成的照片
            setGeneratedPhoto(parsedResponse.imageUrl);
            if (parsedResponse.usedModel) {
              setUsedModel(parsedResponse.usedModel);
            }
          }
        }
    } catch (error) {
      console.error('更换背景时发生错误:', error);
      
      // 提供更具体的错误信息
      let errorMessage = '服务器通信失败';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = '请求超时，请检查网络连接或稍后再试';
        } else if (error.message.includes('Network')) {
          errorMessage = '网络连接失败，请检查您的网络设置';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = '服务器暂时无法访问，请稍后再试';
        } else {
          errorMessage += '：' + error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex max-w-7xl mx-auto flex-col items-center justify-start py-2 min-h-screen bg-[#F7F4E9] dark:bg-slate-900 transition-colors duration-300'>
      <Head>
        <title>{t.passportPhoto.title}</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-start text-center px-4 sm:px-6 lg:px-8 pt-16 pb-6'>
        
        <h1 className='mx-auto max-w-5xl font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-normal text-slate-900 dark:text-slate-100 mb-5 transition-colors duration-300'>
          {t.passportPhoto.title}
        </h1>
        
        {/* 剩余次数提示 - 暂时隐藏 */}
        {/* <div className='mb-6 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700'>
          您今日还剩 <span className='font-bold'>{remainingGenerations}</span> 次免费生成机会，
          将在 {resetHours} 小时和 {resetMinutes} 分钟后重置
        </div> */}
        
        {/* 模型切换提示 */}
        {modelSwitchMessage && (
          <div className='mb-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm text-yellow-700'>
            {modelSwitchMessage}
          </div>
        )}
        
        {/* 当前使用模型显示 */}
        {usedModel && (
          <div className='mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700'>
            当前使用模型: <span className='font-bold'>{usedModel}</span>
          </div>
        )}

        {/* 错误提示 - 放在显眼位置 */}
        {error && (
          <div
            className='bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-500 text-red-800 dark:text-red-200 px-6 py-4 rounded-xl mb-6 max-w-3xl w-full shadow-lg animate-pulse'
            role='alert'
          >
            <div className='flex items-start gap-3 mb-2'>
              <svg className='w-6 h-6 flex-shrink-0 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
              </svg>
              <div className='flex-1'>
                <div className='font-bold text-base mb-2'>错误</div>
                <div className='text-sm whitespace-pre-line leading-relaxed'>
                  {error}
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className='flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors'
                aria-label='关闭错误提示'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* 上传区域 */}
        <div className='flex justify-between items-center w-full flex-col mt-4'>
          {!originalPhoto && <UploadDropZone />}
          
          {/* 参数选择区 */}
          {originalPhoto && (
            <div className='w-full max-w-2xl mt-6 grid grid-cols-1 md:grid-cols-3 gap-6'>
              {/* 尺寸选择 */}
              <div className='bg-white p-4 rounded-xl shadow-lg border-2 border-[#E8DEBB]'>
                <h3 className='font-medium mb-3 text-left text-slate-700'>{t.passportPhoto.selectSize}</h3>
                <div className='flex flex-wrap gap-2'>
                  {[
                    { key: '1寸', value: t.passportPhoto.size1Inch },
                    { key: '2寸', value: t.passportPhoto.size2Inch },
                    { key: '护照', value: t.passportPhoto.sizePassport },
                    { key: '自定义', value: t.passportPhoto.sizeCustom }
                  ].map(({ key, value }) => (
                    <button
                      key={key}
                      className={`px-3 py-1 rounded-full text-sm transition ${(size === key || (key === '自定义' && size.startsWith('custom-'))) 
                        ? 'bg-black text-white shadow-md' 
                        : 'bg-[#F7F4E9] text-slate-700 border border-[#E8DEBB] hover:bg-[#FCF7E3]'}`}
                      onClick={() => {
                        if (key === '自定义') {
                          setShowCustomSizeModal(true);
                        } else {
                          setSize(key);
                        }
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              {/* 背景颜色选择 */}
              <div className='bg-white p-4 rounded-xl shadow-lg border-2 border-[#E8DEBB]'>
                <h3 className='font-medium mb-3 text-left text-slate-700'>{t.passportPhoto.selectBackground}</h3>
                <div className='flex flex-wrap gap-2'>
                  {[
                    { key: '白', value: t.passportPhoto.bgWhite },
                    { key: '蓝', value: t.passportPhoto.bgBlue },
                    { key: '红', value: t.passportPhoto.bgRed },
                    { key: '自定义', value: t.passportPhoto.bgCustom }
                  ].map(({ key: color, value: colorLabel }) => (
                    <button
                      key={color}
                      className={`relative px-3 py-1 rounded-full text-sm transition ${
                        (backgroundColor === color || (color === '自定义' && backgroundColor.startsWith('custom-')))
                          ? 'border-2 border-black bg-[#F7F4E9]' 
                          : 'border border-[#E8DEBB] bg-white hover:bg-[#F7F4E9]'
                      }`}
                      onClick={() => {
                        if (color === '自定义') {
                          setShowCustomColorPicker(true);
                        } else {
                          setBackgroundColor(color);
                          if (generatedPhoto) {
                            changeBackgroundColor(color);
                          }
                        }
                      }}
                      disabled={loading}
                    >
                      <span 
                        className={`inline-block w-4 h-4 rounded-full mr-1`}
                        style={{
                          backgroundColor: backgroundColor.startsWith('custom-') ? backgroundColor.replace('custom-', '') : 
                                          color === '白' ? '#FFFFFF' : 
                                          color === '蓝' ? '#4A90E2' : 
                                          color === '红' ? '#E53935' : '#CCCCCC',
                          border: (color === '白' || (backgroundColor.startsWith('custom-') && color === '自定义')) ? '1px solid #E8DEBB' : 'none'
                        }}
                      ></span>
                      {color === '自定义' && backgroundColor.startsWith('custom-') 
                        ? backgroundColor.replace('custom-', '') 
                        : colorLabel
                      }
                    </button>
                  ))}
                </div>
              </div>

              {/* 服装样式选择 */}
              <div className='bg-white p-4 rounded-xl shadow-lg border-2 border-[#E8DEBB]'>
                <h3 className='font-medium mb-3 text-left text-slate-700'>{t.passportPhoto.selectClothing}</h3>
                <div className='flex flex-wrap gap-2'>
                  {[
                    { key: '正装衬衫', value: t.passportPhoto.clothingFormalShirt },
                    { key: '西服', value: t.passportPhoto.clothingSuit },
                    { key: '休闲装', value: t.passportPhoto.clothingCasual }
                  ].map(({ key, value }) => (
                    <button
                      key={key}
                      className={`px-3 py-1 rounded-full text-sm transition ${clothingStyle === key 
                        ? 'bg-black text-white shadow-md' 
                        : 'bg-[#F7F4E9] text-slate-700 border border-[#E8DEBB] hover:bg-[#FCF7E3]'}`}
                      onClick={() => setClothingStyle(key)}
                      disabled={loading}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 模型选择 */}
              <div className='bg-white p-4 rounded-xl shadow-lg border-2 border-[#E8DEBB] md:col-span-3'>
                <h3 className='font-medium mb-3 text-left text-slate-700'>{t.passportPhoto.selectModel}</h3>
                <div className='flex flex-wrap gap-2'>
                  <button
                    className={`px-3 py-1 rounded-full text-sm transition ${selectedModel === 'ark' 
                      ? 'bg-black text-white shadow-md' 
                      : 'bg-[#F7F4E9] text-slate-700 border border-[#E8DEBB] hover:bg-[#FCF7E3]'}`}
                    onClick={() => setSelectedModel('ark')}
                    disabled={loading}
                    title={language === 'zh' ? '方舟SDK - 豆包生成模型，效果更好，色彩更自然' : 'Ark SDK - Doubao generation model, better effect, more natural colors'}
                  >
                    {t.passportPhoto.modelArkSDK} (doubao-seedream-4-0-250828)
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-sm transition ${selectedModel === 'replicate' 
                      ? 'bg-black text-white shadow-md' 
                      : 'bg-[#F7F4E9] text-slate-700 border border-[#E8DEBB] hover:bg-[#FCF7E3]'}`}
                    onClick={() => setSelectedModel('replicate')}
                    disabled={loading}
                    title={language === 'zh' ? 'Replicate - faceshots模型，适合快速生成和背景更换' : 'Replicate - faceshots model, suitable for quick generation and background replacement'}
                  >
                    {t.passportPhoto.modelReplicate} (editr-apps/faceshots v1.0)
                  </button>
                </div>
                <p className='mt-2 text-xs text-slate-600 text-left leading-relaxed'>
                  * {t.passportPhoto.arkSDKDesc}<br/>
                  * {t.passportPhoto.replicateDesc}<br/>
                  * {t.passportPhoto.modelSwitchNote}
                </p>
              </div>
            </div>
          )}

          {/* 生成按钮 */}
          {originalPhoto && !generatedPhoto && (
            <button
              onClick={generatePassportPhoto}
              disabled={loading || remainingGenerations <= 0}
              className={`bg-black rounded-xl text-white font-medium px-6 py-3 mt-6 hover:bg-black/80 transition ${remainingGenerations <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <LoadingDots color='white' style='large' />
              ) : (
                t.passportPhoto.generate
              )}
            </button>
          )}



          {/* 原图显示 */}
          {originalPhoto && !generatedPhoto && (
            <Image
              alt='上传的照片'
              src={originalPhoto}
              className='rounded-2xl mt-4'
              width={475}
              height={475}
            />
          )}

          {/* 结果展示 */}
          {generatedPhoto && originalPhoto && (
            <div className='flex sm:space-x-4 sm:flex-row flex-col mt-4'>
              <div>
                <h2 className='mb-1 font-medium text-lg'>原图</h2>
                <Image
                  alt='原始照片'
                  src={originalPhoto}
                  className='rounded-2xl relative'
                  width={400}
                  height={400}
                  onError={() => console.error('原图加载失败')}
                />
              </div>
              <div className='sm:mt-0 mt-8'>
                <h2 className='mb-1 font-medium text-lg'>{t.passportPhoto.generatedPhoto}</h2>
                <a href={generatedPhoto} target='_blank' rel='noreferrer'>
                  <Image
                    alt='生成的证件照'
                    src={generatedPhoto}
                    className='rounded-2xl relative sm:mt-0 mt-2 cursor-zoom-in'
                    width={400}
                    height={400}
                    onLoadingComplete={() => setPhotoLoaded(true)}
                    onError={() => {
                      console.error('生成照片加载失败');
                      setError('生成的照片加载失败，请尝试重新生成');
                    }}
                  />
                </a>
              </div>
            </div>
          )}

          
          {/* 自定义尺寸模态框 */}
          {showCustomSizeModal && (
            <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
              <div className='bg-white rounded-xl p-6 max-w-md w-full mx-4'>
                <h3 className='text-xl font-bold mb-4'>{t.passportPhoto.customSize}</h3>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-1'>宽度 (像素)</label>
                    <input
                      type='number'
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      placeholder='例如: 413'
                      className='w-full px-4 py-2 border border-[#E8DEBB] rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white text-slate-700'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-1'>高度 (像素)</label>
                    <input
                      type='number'
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      placeholder='例如: 531'
                      className='w-full px-4 py-2 border border-[#E8DEBB] rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white text-slate-700'
                    />
                  </div>
                  <div className='flex space-x-3 pt-2'>
                    <button
                      onClick={() => {
                        setShowCustomSizeModal(false);
                        setCustomWidth('');
                        setCustomHeight('');
                      }}
                      className='flex-1 bg-white rounded-lg px-4 py-2 font-medium border-2 border-[#E8DEBB] text-slate-700 hover:bg-[#F7F4E9] transition'
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        if (customWidth && customHeight && !isNaN(Number(customWidth)) && !isNaN(Number(customHeight))) {
                          setSize(`custom-${customWidth}x${customHeight}`);
                          setShowCustomSizeModal(false);
                        }
                      }}
                      disabled={!customWidth || !customHeight || isNaN(Number(customWidth)) || isNaN(Number(customHeight))}
                      className={`flex-1 bg-black text-white rounded-lg px-4 py-2 font-medium hover:bg-black/80 transition ${
                        !customWidth || !customHeight || isNaN(Number(customWidth)) || isNaN(Number(customHeight))
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      确定
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 自定义颜色选择器 */}
          {showCustomColorPicker && (
            <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
              <div className='bg-white rounded-xl p-6 max-w-md w-full mx-4'>
                <h3 className='text-xl font-bold mb-4'>{t.passportPhoto.customBackground}</h3>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-4'>
                    <div 
                      className='w-16 h-16 rounded-lg border-2 border-[#E8DEBB]'
                      style={{ backgroundColor: customColor }}
                    ></div>
                    <input
                      type='color'
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className='w-full h-12 border-2 border-[#E8DEBB] rounded-lg cursor-pointer'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-1'>颜色代码</label>
                    <input
                      type='text'
                      value={customColor}
                      onChange={(e) => {
                        // 简单验证是否为有效的十六进制颜色
                        if (/^#([0-9A-F]{3}){1,2}$/i.test(e.target.value)) {
                          setCustomColor(e.target.value);
                        }
                      }}
                      placeholder='#FF0000'
                      className='w-full px-4 py-2 border border-[#E8DEBB] rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white text-slate-700'
                    />
                  </div>
                  <div className='flex space-x-3 pt-2'>
                    <button
                      onClick={() => {
                        setShowCustomColorPicker(false);
                      }}
                      className='flex-1 bg-white rounded-lg px-4 py-2 font-medium border-2 border-[#E8DEBB] text-slate-700 hover:bg-[#F7F4E9] transition'
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        setBackgroundColor(`custom-${customColor}`);
                        setShowCustomColorPicker(false);
                        if (generatedPhoto) {
                          changeBackgroundColor(`custom-${customColor}`);
                        }
                      }}
                      className='flex-1 bg-black text-white rounded-lg px-4 py-2 font-medium hover:bg-black/80 transition'
                    >
                      确定
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className='flex space-x-3 justify-center mt-8'>
            {originalPhoto && (
              <button
                onClick={() => {
            setOriginalPhoto(null);
            setPhotoFile(null);
            setGeneratedPhoto(null);
            setPhotoLoaded(false);
            setError(null);
          }}
                className='bg-white rounded-xl text-slate-700 border-2 border-[#E8DEBB] font-medium px-4 py-2 hover:bg-[#F7F4E9] transition shadow-md'
              >
                {t.passportPhoto.uploadNewPhoto}
              </button>
            )}
            {generatedPhoto && (
              <button
                onClick={async () => {
                  console.log('重新生成按钮点击，开始重新生成证件照');
                  // 重置状态
                  setGeneratedPhoto(null);
                  setPhotoLoaded(false);
                  setError(null);
                  
                  // 强制UI更新后再执行生成操作
                  await new Promise(resolve => setTimeout(resolve, 200));
                  
                  console.log('状态已重置，调用生成函数');
                  await generatePassportPhoto();
                }}
                disabled={loading || remainingGenerations <= 0}
                className={`bg-white rounded-xl text-slate-700 border-2 border-[#E8DEBB] font-medium px-4 py-2 hover:bg-[#F7F4E9] transition shadow-md ${remainingGenerations <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {t.passportPhoto.regenerate}
              </button>
            )}
            {photoLoaded && generatedPhoto && (
              <button
                onClick={() => {
                  downloadPhoto(generatedPhoto!, appendNewToName(photoName!));
                }}
                className='bg-black rounded-xl text-white font-medium px-4 py-2 hover:bg-black/80 transition'
              >
                {t.passportPhoto.download}
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PassportPhoto;