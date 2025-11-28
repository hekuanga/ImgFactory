import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import multer from 'multer';
import { getMaxFileSize, formatFileSize } from '../../constants/upload';
import { verifyAuth } from '../../lib/auth-middleware';
import prisma from '../../lib/prismadb';

// 根据是否有 API key 获取最大文件大小（后端默认使用付费账户限制）
const hasApiKey = !!process.env.NEXT_PUBLIC_UPLOAD_API_KEY;
const MAX_FILE_SIZE = getMaxFileSize(hasApiKey);

// 配置临时存储
const upload = multer({ 
  limits: { fileSize: MAX_FILE_SIZE },
  storage: multer.memoryStorage() // 使用内存存储
});

// 创建Next.js连接实例
const apiRoute = createRouter();

// 处理文件上传，添加错误处理中间件
// 注意：只有当请求包含文件时才使用 multer，否则直接解析 JSON body
apiRoute.use(async (req: any, res: any, next: any) => {
  // 确保响应头设置为 JSON
  res.setHeader('Content-Type', 'application/json');
  
  // 检查 Content-Type 是否为 multipart/form-data（文件上传）
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    // 文件上传方式，使用 multer
    upload.single('image')(req as any, res as any, (err: any) => {
      if (err) {
        // Multer 错误处理，确保返回 JSON 格式
        if (err.code === 'LIMIT_FILE_SIZE') {
          const maxSizeStr = formatFileSize(MAX_FILE_SIZE);
          return res.status(200).json({ 
            error: `文件大小超过限制（最大 ${maxSizeStr}），请压缩图片后重试`,
            imageUrl: ''
          });
        }
        // 处理其他 multer 错误
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(200).json({ 
            error: '文件字段名不正确，请使用 "image" 作为字段名',
            imageUrl: ''
          });
        }
        return res.status(200).json({ 
          error: `文件上传失败: ${err.message || '未知错误'}`,
          imageUrl: ''
        });
      }
      next();
    });
  } else {
    // JSON 方式，手动解析 body（因为 bodyParser 被禁用了）
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        if (body) {
          req.body = JSON.parse(body);
        }
        next();
      } catch (e) {
        return res.status(200).json({ 
          error: '请求体解析失败',
          imageUrl: ''
        });
      }
    });
  }
});

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

// 扩展NextApiRequest类型以支持file属性
declare module 'next' {
  interface NextApiRequest {
    file?: UploadedFile;
  }
}

interface ApiResponse {
  imageUrl?: string;
  usedModel?: string;
  error?: string;
  modelSwitchInfo?: string;
}

// 获取不同尺寸的像素值
const getSizeDimensions = (size: string) => {
  // 处理自定义尺寸
  if (size.startsWith('custom-')) {
    const parts = size.replace('custom-', '').split('x');
    if (parts.length === 2) {
      const width = parseInt(parts[0], 10);
      const height = parseInt(parts[1], 10);
      if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
        return { width, height };
      }
    }
    return { width: 640, height: 640 }; // 默认尺寸
  }
  
  // 处理预设尺寸
  switch (size) {
    case '1寸':
      return { width: 512, height: 698 }; // 1寸证件照尺寸
    case '2寸':
      return { width: 626, height: 879 }; // 2寸证件照尺寸
    case '护照':
      return { width: 600, height: 600 }; // 护照照片尺寸
    default:
      return { width: 640, height: 640 }; // 默认尺寸
  }
};

// 根据用户选择生成对应的提示词
const generatePrompt = (size: string, backgroundColor: string, clothingStyle: string, skipClothing: boolean) => {
  // 获取尺寸信息
  const dimensions = getSizeDimensions(size);
  
  // 根据尺寸类型确定厘米尺寸描述
  let sizeInCm = '';
  switch (size) {
    case '1寸':
      sizeInCm = '2.5cm×3.5cm';
      break;
    case '2寸':
      sizeInCm = '3.5cm×5.3cm';
      break;
    case '护照':
      sizeInCm = '3.5cm×4.5cm';
      break;
    default:
      // 对于自定义尺寸或默认尺寸，使用最接近的标准尺寸
      sizeInCm = '3.5cm×4.5cm';
  }
  
  // 服装描述
  let clothingDesc = '';
  if (!skipClothing) {
    switch (clothingStyle) {
      case '正装衬衫':
      case '正装':
        clothingDesc = 'formal business suit, light-colored shirt';
        break;
      case '西服':
        clothingDesc = 'formal business suit, light-colored shirt';
        break;
      case '休闲装':
        clothingDesc = 'neat casual clothing';
        break;
      default:
        clothingDesc = 'appropriate attire for ID photo';
    }
  } else {
    clothingDesc = 'original clothing';
  }
  
  // 使用详细的提示词模板，包含尺寸规格信息
  const prompt = `请生成一张符合正式证件照标准的真实照片，要求如下：
背景为纯${backgroundColor}色，颜色均匀、无渐变、无阴影。
人物居中，头部与肩膀完整露出，构图比例标准。
照片尺寸为 ${sizeInCm}（约${dimensions.width}×${dimensions.height}像素）。
拍摄环境为柔和均匀的影棚光线，光影自然不过曝。
主体穿着${clothingDesc}，无饰品、无道具。
表情自然、不笑、不露齿、目视前方。
皮肤允许轻度美化（10%以内），可让肤色干净明亮，但必须保留毛孔、细节与真实质感。
图像需高分辨率、对焦清晰、无噪点、无模糊。
整体画面干净整洁，无相框、无边框、无文字、水印、logo、装饰、渐变、虚化或艺术滤镜效果。
最终效果应真实自然、清爽端正，符合护照或身份证等正式证件照要求。`;
  
  return prompt;
};

// 生成负面提示词
const generateNegativePrompt = () => {
  return '相框、边框、装饰、滤镜、文字、水印、logo、背景杂乱或渐变、光影不均、过度美颜、塑料质感、磨皮严重、无毛孔皮肤、发光肤色、AI痕迹、艺术风格化、面部比例失真、夸张妆容、低分辨率、虚化或模糊区域、beauty filter, retouched skin, airbrushed, AI enhancement, over-smooth skin, plastic look, poreless skin, face morphing, unrealistic perfection, makeup, glowing skin, stylized portrait, inconsistent face, distorted features, smiling, closed eyes, uneven lighting, low resolution, text, watermark, busy background';
};

// 处理请求的主函数
const processRequest = async (req: NextApiRequest, res: NextApiResponse<ApiResponse>) => {
  // 从FormData中获取文本字段
  const size = req.body.size as string;
  const backgroundColor = req.body.backgroundColor as string;
  const clothingStyle = req.body.clothingStyle as string;
  const skipClothing = req.body.skipClothing === 'true';
  const selectedModel = (req.body.selectedModel as string) || 'ark';
  
  // 获取上传的文件或直接传入的 URL
  const file = req.file as UploadedFile | undefined;
  const imageUrlFromBody = req.body.imageUrl as string | undefined;
  
  let imageUrl: string;
  
  // 支持两种方式：文件上传或直接传入 URL
  if (imageUrlFromBody) {
    // 如果直接传入了 URL，使用 URL
    imageUrl = imageUrlFromBody;
    console.log('使用直接传入的图片URL:', imageUrl.substring(0, 100) + '...');
  } else if (file) {
    // 如果上传了文件，转换为 DataURL
    console.log('文件上传成功:', file.originalname, '大小:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('内容类型:', file.mimetype);
    imageUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    console.log('已转换为DataURL，准备处理');
  } else {
    // 参数验证
    return res.status(200).json({ 
      error: '缺少必要的参数：请上传文件或提供图片URL',
      imageUrl: ''
    });
  }
  
  // 参数验证
  if (!size || !backgroundColor || !clothingStyle) {
    return res.status(200).json({ 
      error: '缺少必要的参数：尺寸、背景颜色或服装风格',
      imageUrl: ''
    });
  }
  
  // 保存用户信息，用于后续积分扣除
  let authenticatedUser: { id: string } | null = null;
  
  // 检查用户登录状态和积分（在开始处理之前）
  try {
    const user = await verifyAuth(req, res);
    if (!user) {
      // 用户未登录，返回错误并停止API调用
      console.warn('用户未登录，无法生成证件照');
      return res.status(401).json({ 
        error: 'UNAUTHORIZED',
        imageUrl: ''
      } as ApiResponse);
    }
    
    // 保存用户信息，用于后续积分扣除
    authenticatedUser = { id: user.id };
    
    const userRecord = await (prisma.user.findUnique as any)({
      where: { id: user.id },
      select: { credits: true }
    });

    const currentCredits = userRecord?.credits || 0;
    
    if (currentCredits < 1) {
      console.warn('用户积分不足，无法生成证件照');
      return res.status(400).json({ 
        error: 'INSUFFICIENT_CREDITS',
        imageUrl: ''
      } as ApiResponse);
    }
  } catch (creditCheckError: any) {
    // 如果是列不存在错误（P2022），允许继续（兼容旧数据库）
    if (creditCheckError?.code === 'P2022' || creditCheckError?.message?.includes('does not exist')) {
      console.warn('Credits column does not exist, skipping credit check');
      // 即使列不存在，仍然需要检查登录状态
      const user = await verifyAuth(req, res);
      if (!user) {
        return res.status(401).json({ 
          error: 'UNAUTHORIZED',
          imageUrl: ''
        } as ApiResponse);
      }
      authenticatedUser = { id: user.id };
    } else {
      // 其他错误（如未登录）返回错误
      console.log('Credit check failed:', creditCheckError);
      return res.status(401).json({ 
        error: 'UNAUTHORIZED',
        imageUrl: ''
      } as ApiResponse);
    }
  }
  
  let usedModel = '';
  let modelSwitchInfo: string | undefined;
  const startTime = Date.now();
  

  try {
    // 获取尺寸信息
    const dimensions = getSizeDimensions(size);
    
    // 处理自定义背景颜色
    const bgColor = backgroundColor.startsWith('custom-') ? backgroundColor.replace('custom-', '') : backgroundColor;
    
    // 生成提示词
    const prompt = generatePrompt(size, bgColor, clothingStyle, skipClothing);
    const negativePrompt = generateNegativePrompt();

    // 按格式输出指定参数
    console.log('image:', imageUrl.startsWith('data:image/') ? 'DataURL (hidden for security)' : imageUrl);
    console.log('width:', dimensions.width);
    console.log('height:', dimensions.height);
    console.log('prompt:', prompt);
    console.log('negative_prompt:', negativePrompt);
    
    // 检查是否为DataURL，如果是，需要特殊处理
    const isDataUrl = imageUrl.startsWith('data:image/');
    console.log('是否为DataURL格式:', isDataUrl);
    
    // 开发环境优化：简化API密钥验证逻辑，允许即使没有密钥也能提供模拟响应
    const isDev = process.env.NODE_ENV === 'development';
    
    // 根据选择的模型决定调用顺序
    // 如果选择方舟或未指定，优先使用方舟SDK API
    // 根据选择的模型决定调用顺序
    // 如果选择方舟或未指定，优先使用方舟SDK API
    if ((selectedModel === 'ark' || !selectedModel) && process.env.ARK_API_KEY && process.env.ARK_API_KEY !== 'YOUR_ARK_API_KEY') {
      usedModel = '方舟SDK (doubao-seedream-4-0-250828)';
      console.log('使用模型:', usedModel);
      
      let retryCount = 0;
      const maxRetries = isDev ? 1 : 2; // 开发环境少重试，生产环境多重试
      
      while (retryCount <= maxRetries) {
        try {
          // 准备尺寸参数
          // 根据Postman测试，size支持 "2K"/"4K" 或 "WxH" 格式（如 1024x1024/2048x2048）
          // 根据实际尺寸选择合适的预设值
          let sizeStr: string;
          const totalPixels = dimensions.width * dimensions.height;
          
          // 根据总像素选择合适的尺寸预设
          // 2K 大约对应 2048x2048 = 4,194,304 像素
          // 4K 大约对应 4096x4096 = 16,777,216 像素
          // 也可以使用 WxH 格式，如 1024x1024 或 2048x2048
          if (totalPixels <= 2 * 1024 * 1024) {
            // 小于等于 2M 像素，使用 2K 或具体尺寸
            sizeStr = "2K";
          } else if (totalPixels <= 8 * 1024 * 1024) {
            // 2M-8M 像素，使用 4K
            sizeStr = "4K";
          } else {
            // 超过 8M 像素，使用具体尺寸格式 WxH
            sizeStr = `${dimensions.width}x${dimensions.height}`;
          }
          
          console.log(`使用尺寸: ${sizeStr} (原始尺寸: ${dimensions.width}x${dimensions.height}, 总像素: ${totalPixels})`);
          
          // 将negative_prompt融入到prompt中
          const fullPrompt = `${prompt} ${negativePrompt ? `Negative prompt: ${negativePrompt}` : ''}`;
          
          // 构建请求参数（根据Postman测试成功的配置）
          const requestData = {
            model: "doubao-seedream-4-0-250828",
            prompt: fullPrompt,
            image: imageUrl, // 图生图时提供公网可达 URL
            size: sizeStr, // 支持 "2K"/"4K" 或 "WxH" 格式
            sequential_image_generation: "disabled" as const,
            stream: false, // 布尔值
            response_format: "url" as const,
            watermark: false // 布尔值 - 不添加水印
          };
          
          console.log(`开始调用方舟SDK API... (尝试 ${retryCount + 1}/${maxRetries + 1})`);
          console.log('方舟SDK请求参数:', {
            model: requestData.model,
            prompt: requestData.prompt.substring(0, 100) + '...',
            image: requestData.image ? (requestData.image.length > 100 ? requestData.image.substring(0, 100) + '... (URL, 长度: ' + requestData.image.length + ')' : requestData.image) : '无',
            size: requestData.size,
            response_format: requestData.response_format,
            watermark: requestData.watermark,
            stream: requestData.stream
          });
          
          // 检查 API 密钥
          if (!process.env.ARK_API_KEY || process.env.ARK_API_KEY === 'YOUR_ARK_API_KEY') {
            console.error('ARK_API_KEY 未配置或使用了默认值');
            throw new Error('方舟SDK服务暂时不可用');
          }
          
          // 检查 DataURL 大小（base64 编码会增加约 33% 的大小）
          const imageDataSize = requestData.image ? requestData.image.length : 0;
          if (imageDataSize > 20 * 1024 * 1024) { // 约 15MB 原始图片（20MB base64）
            console.warn(`警告: DataURL 大小较大 (${(imageDataSize / 1024 / 1024).toFixed(2)}MB)，可能导致请求失败`);
          }
          
          // 使用方舟SDK官方API端点（根据Python示例代码）
          // 增加超时时间到 120 秒，因为处理大图片需要更长时间
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒超时
          
          // 根据Postman测试，使用正确的端点
          const apiUrl = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
          
          // 生成 Idempotency-Key (UUIDv4) 保证幂等性
          const generateUUID = () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
              const r = Math.random() * 16 | 0;
              const v = c === 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
          };
          const idempotencyKey = generateUUID();
          
          console.log('===== 开始调用方舟SDK API =====');
          console.log('API URL:', apiUrl);
          console.log('API 密钥长度:', process.env.ARK_API_KEY?.length || 0);
          console.log('Idempotency-Key:', idempotencyKey);
          console.log('请求参数:', {
            model: requestData.model,
            prompt: requestData.prompt.substring(0, 100) + '...',
            image: requestData.image ? (requestData.image.length > 100 ? requestData.image.substring(0, 100) + '... (URL, 长度: ' + requestData.image.length + ')' : requestData.image) : '无',
            size: requestData.size,
            sequential_image_generation: requestData.sequential_image_generation,
            stream: requestData.stream,
            response_format: requestData.response_format,
            watermark: requestData.watermark
          });
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.ARK_API_KEY || ''}`,
              'Idempotency-Key': idempotencyKey // 保证幂等性
            },
            body: JSON.stringify(requestData),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          console.log('方舟SDK响应状态:', response.status, response.statusText);
          console.log('方舟SDK响应头:', Object.fromEntries(response.headers.entries()));
          
          if (!response.ok) {
            console.error(`方舟SDK API错误: ${response.status} ${response.statusText}`);
            // 记录响应内容以便调试
            let errorBody: string;
            let errorData: any;
            try {
              errorBody = await response.text();
              try {
                errorData = JSON.parse(errorBody);
              } catch {
                errorData = { message: errorBody };
              }
            } catch {
              errorBody = '无法读取错误响应';
              errorData = {};
            }

            console.error('方舟SDK错误响应内容:', errorBody);

            // 解析错误码和消息
            const errorCode = errorData?.error?.code || errorData?.code;
            const errorDetail = errorData?.error?.message || errorData?.message || errorBody;
            const errorDetailText = typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail);

            console.log('方舟SDK错误码:', errorCode || '未知');
            console.log('方舟SDK错误详情:', errorDetailText);

            // 根据状态码提供更具体的错误信息（不暴露配置信息）
            let errorMessage = `方舟SDK服务错误: ${response.status}`;
            if (response.status === 401) {
              errorMessage = '方舟SDK服务认证失败';
            } else if (response.status === 403) {
              errorMessage = '方舟SDK服务权限不足';
            } else if (response.status === 400 || response.status === 422) {
              errorMessage = '方舟SDK服务请求格式错误';
            } else if (response.status === 413) {
              errorMessage = '图片太大，请压缩后重试';
            } else if (response.status === 429) {
              errorMessage = '请求频率限制，请稍后再试';
            } else if (response.status >= 500) {
              errorMessage = '方舟SDK服务暂时不可用，请稍后再试';
            }

            // 针对特定错误码提供额外提示
            if (errorCode === 'InvalidParameter.UnsupportedImageFormat') {
              errorMessage += '\n提示：方舟SDK当前仅支持公网可访问的 JPG/PNG 图片链接，请确认图片格式和链接可访问性。\nHint: Ark SDK only supports publicly accessible JPG/PNG image URLs.';
            }

            throw new Error(errorMessage);
          }
          
          const responseData = await response.json();
          console.log('方舟SDK响应数据:', responseData);
          console.log('响应内容类型:', response.headers.get('content-type'));
          
          // 根据Postman测试，响应格式为：
          // response_format=url: data[*].url
          // response_format=b64_json: data[*].b64_json
          // 校验响应 JSON 与 data 数组
          let generatedImageUrl: string | undefined;
          
          if (responseData && responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
            // 遍历 data 数组，查找第一个有效的 URL
            for (const item of responseData.data) {
              if (item.url) {
                generatedImageUrl = item.url;
                if (generatedImageUrl) {
                  console.log('从 data 数组提取 URL:', generatedImageUrl.substring(0, 150));
                }
                break;
              } else if (item.b64_json) {
                // 如果返回的是 base64，转换为 DataURL
                generatedImageUrl = `data:image/png;base64,${item.b64_json}`;
                console.log('从 data 数组提取 base64，已转换为 DataURL');
                break;
              }
            }
            
            // 如果返回了 size，记录日志
            if (responseData.size) {
              console.log('返回的图片尺寸:', responseData.size);
            }
          } else if (responseData && responseData.url) {
            // 兼容直接返回 url 的情况
            generatedImageUrl = responseData.url;
            if (generatedImageUrl) {
              console.log('从响应根对象提取 URL:', generatedImageUrl.substring(0, 150));
            }
          }
          
          if (generatedImageUrl) {
            const endTime = Date.now();
            console.log(`方舟SDK生成完成，耗时: ${endTime - startTime}ms`);
            console.log('最终生成的图片URL:', generatedImageUrl.substring(0, 150));
            
            // 扣除积分（只有在成功生成图片后才扣除）
            try {
              // 使用之前保存的用户信息，避免重复调用 verifyAuth
              if (authenticatedUser && generatedImageUrl) {
                // 提取用户ID到局部变量，确保类型安全
                const userId = authenticatedUser.id;
                await prisma.$transaction(async (tx: any) => {
                  await tx.user.update({
                    where: { id: userId },
                    data: {
                      credits: {
                        decrement: 1
                      }
                    }
                  });

                  await tx.creditHistory.create({
                    data: {
                      userId: userId,
                      amount: -1,
                      type: 'deduct',
                      description: '证件照生成'
                    }
                  });
                });
                console.log('积分扣除成功（证件照生成成功），用户ID:', userId);
              } else if (!authenticatedUser) {
                console.log('用户未登录，跳过积分扣除');
              }
            } catch (creditError: any) {
              // 如果是列不存在错误（P2022），静默处理
              if (creditError?.code === 'P2022' || creditError?.message?.includes('does not exist')) {
                console.warn('Credits column does not exist in database, skipping credit deduction');
              } else {
                console.error('扣除积分时出错:', creditError);
              }
            }
            
            // 返回生成的图像URL和使用的模型
            return res.status(200).json({
              imageUrl: generatedImageUrl,
              usedModel: usedModel,
              modelSwitchInfo: modelSwitchInfo
            });
          } else {
            console.error('无法从响应中提取图片URL，响应数据:', JSON.stringify(responseData, null, 2));
            throw new Error('方舟SDK返回了无效的输出格式：响应中未找到 data 数组或 url 字段');
          }
        } catch (error) {
          // 详细的错误日志
          console.error(`方舟SDK API调用失败 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, error);
          if (error instanceof Error) {
            console.error('错误名称:', error.name);
            console.error('错误消息:', error.message);
            console.error('错误堆栈:', error.stack);
            if ('cause' in error) {
              console.error('错误原因:', error.cause);
            }
          }
          
          // 检查是否是超时错误
          if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted') || error.message.includes('timeout'))) {
            console.error('方舟SDK API请求超时 - 可能原因：1) 图片太大 2) 网络慢 3) 服务器处理时间长');
            if (retryCount >= maxRetries) {
              modelSwitchInfo = '方舟SDK请求超时，处理大图片需要更长时间，将尝试使用Replicate备选方案';
            }
          } else if (error instanceof TypeError && error.message.includes('fetch failed')) {
            // 网络错误处理
            if ('cause' in error && error.cause && typeof error.cause === 'object' && 'code' in error.cause) {
              const errorCode = error.cause.code;
              console.error('网络连接错误代码:', errorCode);
              if (errorCode === 'ENOTFOUND') {
                console.error('DNS解析失败：无法解析 ark.cn-beijing.volces.com，请检查网络连接或DNS配置');
                if (retryCount >= maxRetries) {
                  modelSwitchInfo = '网络连接错误：无法连接到方舟SDK服务器，请检查网络连接';
                }
              } else if (errorCode === 'ECONNREFUSED') {
                console.error('连接被拒绝：API服务器可能不可用');
                if (retryCount >= maxRetries) {
                  modelSwitchInfo = '方舟SDK服务器连接被拒绝，请稍后再试';
                }
              } else if (errorCode === 'ETIMEDOUT') {
                console.error('连接超时：网络延迟过高');
                if (retryCount >= maxRetries) {
                  modelSwitchInfo = '网络连接超时，请检查网络连接';
                }
              } else {
                console.error('其他网络错误:', errorCode);
                if (retryCount >= maxRetries) {
                  modelSwitchInfo = '网络请求失败：与方舟SDK服务器通信时出现问题';
                }
              }
            } else {
              console.error('未知网络错误');
              if (retryCount >= maxRetries) {
                modelSwitchInfo = '网络请求失败：与方舟SDK服务器通信时出现问题';
              }
            }
          } else if (error instanceof Error && error.message.includes('ARK_API_KEY')) {
            console.error('API密钥配置错误：', error.message);
            if (retryCount >= maxRetries) {
              // 不暴露配置信息，只记录到日志
              modelSwitchInfo = '方舟SDK服务暂时不可用';
            }
          } else if (error instanceof Error && error.message.includes('请求体过大')) {
            console.error('请求体过大：DataURL 太大，需要压缩图片');
            if (retryCount >= maxRetries) {
              modelSwitchInfo = '图片太大，请压缩后重试';
            }
          } else {
            console.error('其他错误类型:', error);
            if (retryCount >= maxRetries) {
              // 不暴露详细错误信息
              modelSwitchInfo = '方舟SDK服务暂时不可用';
            }
          }
          
          retryCount++;
          
          // 如果未达到最大重试次数，等待一段时间后重试
          if (retryCount <= maxRetries) {
            const waitTime = 1000 * Math.pow(2, retryCount - 1); // 指数退避策略
            console.log(`等待${waitTime}ms后重试...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          } else {
            // 返回错误代码，让前端根据语言显示
            return res.status(500).json({
              error: 'SERVICE_UNAVAILABLE',
              model: 'ark',
              imageUrl: ''
            } as ApiResponse);
          }
        }
      }
    }
    
    // 如果用户选择的是Replicate模型，调用Replicate API
    if (selectedModel === 'replicate' && process.env.REPLICATE_API_KEY && process.env.REPLICATE_API_KEY !== 'YOUR_REPLICATE_API_KEY') {
      usedModel = 'Replicate (flux-kontext-apps/professional-headshot)';
      console.log('使用模型:', usedModel);
      
      try {
        // 使用 Replicate REST API，参考Python示例
        const modelId = 'flux-kontext-apps/professional-headshot';
        const apiUrl = `https://api.replicate.com/v1/models/${modelId}/predictions`;
        
        // 根据背景颜色映射到Replicate的background参数
        // Replicate支持的background选项: "white", "black", "neutral", "gray", "office"
        // 注意：这里使用函数参数中的 backgroundColor（已经处理过自定义颜色）
        let replicateBackground = 'neutral';
        const bgColorForReplicate = bgColor; // 使用之前处理过的 bgColor
        if (bgColorForReplicate === '白' || bgColorForReplicate === 'white') {
          replicateBackground = 'white';
        } else if (bgColorForReplicate === '蓝' || bgColorForReplicate === 'blue') {
          // Replicate不支持blue，使用gray作为替代
          replicateBackground = 'gray';
        } else if (bgColorForReplicate === '红' || bgColorForReplicate === 'red') {
          // Replicate不支持red，使用neutral作为替代
          replicateBackground = 'neutral';
        } else if (bgColorForReplicate.startsWith('custom-')) {
          // 自定义颜色，使用neutral作为默认值
          replicateBackground = 'neutral';
        }
        
        // 计算宽高比（根据Python示例，支持 "1:1", "3:4", "4:3" 等）
        const aspectRatio = `${dimensions.width}:${dimensions.height}`;
        // 简化常见的宽高比
        let aspectRatioStr = aspectRatio;
        const ratio = dimensions.width / dimensions.height;
        if (Math.abs(ratio - 1) < 0.01) {
          aspectRatioStr = '1:1';
        } else if (Math.abs(ratio - 3/4) < 0.01) {
          aspectRatioStr = '3:4';
        } else if (Math.abs(ratio - 4/3) < 0.01) {
          aspectRatioStr = '4:3';
        } else if (Math.abs(ratio - 16/9) < 0.01) {
          aspectRatioStr = '16:9';
        } else if (Math.abs(ratio - 9/16) < 0.01) {
          aspectRatioStr = '9:16';
        }
        
        // 构建请求参数（根据Python示例）
        const requestData = {
          input: {
            gender: 'female', // 默认值，可以根据需要调整或从用户输入获取
            background: replicateBackground,
            input_image: imageUrl,
            aspect_ratio: aspectRatioStr,
            output_format: 'png',
            safety_tolerance: 2
          }
        };

        console.log('===== 开始调用Replicate API =====');
        console.log('使用模型:', modelId);
        console.log('API URL:', apiUrl);
        console.log('API 密钥长度:', process.env.REPLICATE_API_KEY?.length || 0);
        console.log('请求参数:', {
          model: modelId,
          gender: requestData.input.gender,
          background: requestData.input.background,
          input_image: imageUrl ? (imageUrl.length > 100 ? imageUrl.substring(0, 100) + '... (URL, 长度: ' + imageUrl.length + ')' : imageUrl) : '无',
          aspect_ratio: requestData.input.aspect_ratio,
          output_format: requestData.input.output_format,
          safety_tolerance: requestData.input.safety_tolerance
        });
        
        // 添加超时设置（参考照片修复功能）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.error('Replicate API 请求超时 (120秒)');
          controller.abort();
        }, 120000); // 120秒超时
        
        // POST request to Replicate（参考照片修复功能）
        let startResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (process.env.REPLICATE_API_KEY || ''),
            'Prefer': 'wait' // 等待结果返回，而不是异步
          },
          body: JSON.stringify(requestData),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('Replicate API 响应状态:', startResponse.status, startResponse.statusText);
        console.log('Replicate API 响应头:', Object.fromEntries(startResponse.headers.entries()));

        let jsonStartResponse = await startResponse.json();
        console.log('Replicate API 响应数据:', JSON.stringify(jsonStartResponse, null, 2).substring(0, 500));
        
        // 添加错误处理，检查response状态和数据格式（参考照片修复功能）
        if (!startResponse.ok) {
          console.error('Replicate API 错误:', jsonStartResponse);
          
          // 根据状态码提供更具体的错误信息（不暴露配置信息）
          let errorMessage = `Replicate服务错误: ${startResponse.status}`;
          if (startResponse.status === 401) {
            errorMessage = 'Replicate服务认证失败';
            console.error('API 认证失败：请检查环境变量中的 REPLICATE_API_KEY');
          } else if (startResponse.status === 400) {
            const errorDetail = jsonStartResponse.error || jsonStartResponse.detail || '请求格式错误';
            errorMessage = 'Replicate服务请求格式错误';
            console.error('请求格式错误详情:', errorDetail);
          } else if (startResponse.status === 413) {
            errorMessage = '图片太大，请压缩后重试';
            console.error('请求体过大：图片太大');
          } else if (startResponse.status === 429) {
            errorMessage = '请求频率限制，请稍后再试';
            console.error('请求频率限制：已达到 API 调用限制');
          } else if (startResponse.status >= 500) {
            errorMessage = 'Replicate服务暂时不可用，请稍后再试';
            console.error('服务器错误：Replicate 服务暂时不可用');
          }
          
          throw new Error(errorMessage);
        }
        
        // 检查响应中是否包含output字段（参考照片修复功能）
        let generatedImageUrl: string | null = null;
        
        console.log('Replicate 输出类型:', typeof jsonStartResponse.output);
        console.log('Replicate 输出内容:', jsonStartResponse.output ? (typeof jsonStartResponse.output === 'string' ? jsonStartResponse.output.substring(0, 100) + '...' : JSON.stringify(jsonStartResponse.output).substring(0, 200)) : 'null');
        
        // 直接从响应中提取output（参考照片修复功能）
        if (jsonStartResponse.output) {
          // 新模型可能返回不同格式的output
          if (typeof jsonStartResponse.output === 'string') {
            generatedImageUrl = jsonStartResponse.output;
            if (generatedImageUrl) {
              console.log('Replicate返回字符串URL:', generatedImageUrl.substring(0, 150));
            }
          } else if (jsonStartResponse.output.url) {
            generatedImageUrl = jsonStartResponse.output.url;
            if (generatedImageUrl) {
              console.log('Replicate返回对象URL:', generatedImageUrl.substring(0, 150));
            }
          } else {
            // 尝试字符串化输出以捕获其他格式
            generatedImageUrl = JSON.stringify(jsonStartResponse.output);
            if (generatedImageUrl) {
              console.warn('Replicate返回了非标准格式，已转换为字符串:', generatedImageUrl.substring(0, 200));
            }
          }
        }
        
        if (!generatedImageUrl) {
          console.error('无法从响应中提取输出:', jsonStartResponse);
          throw new Error('Replicate返回了无效的输出格式');
        }
        
        // 此时 generatedImageUrl 一定不为 null，TypeScript 需要类型断言
        const finalImageUrl: string = generatedImageUrl;

        const endTime = Date.now();
        console.log(`Replicate生成完成，耗时: ${endTime - startTime}ms`);
        console.log('最终返回的图片URL:', finalImageUrl.substring(0, 150));
        console.log('===== Replicate请求完成 =====');
        
        // 扣除积分（只有在成功生成图片后才扣除）
        try {
          // 使用之前保存的用户信息，避免重复调用 verifyAuth
          if (authenticatedUser && finalImageUrl) {
            // 提取用户ID到局部变量，确保类型安全
            const userId = authenticatedUser.id;
            await prisma.$transaction(async (tx: any) => {
              await tx.user.update({
                where: { id: userId },
                data: {
                  credits: {
                    decrement: 1
                  }
                }
              });

              await tx.creditHistory.create({
                data: {
                  userId: userId,
                  amount: -1,
                  type: 'deduct',
                  description: '证件照生成'
                }
              });
            });
            console.log('积分扣除成功（证件照生成成功），用户ID:', userId);
          } else if (!authenticatedUser) {
            console.log('用户未登录，跳过积分扣除');
          }
        } catch (creditError: any) {
          // 如果是列不存在错误（P2022），静默处理
          if (creditError?.code === 'P2022' || creditError?.message?.includes('does not exist')) {
            console.warn('Credits column does not exist in database, skipping credit deduction');
          } else {
            console.error('扣除积分时出错:', creditError);
          }
        }
        
        // 返回生成的图像URL和使用的模型
        return res.status(200).json({
          imageUrl: finalImageUrl,
          usedModel: usedModel,
          modelSwitchInfo: modelSwitchInfo
        });
      } catch (error) {
        console.error('===== Replicate API调用失败 =====');
        console.error('错误对象:', error);
        
        if (error instanceof Error) {
          console.error('错误名称:', error.name);
          console.error('错误消息:', error.message);
          console.error('错误堆栈:', error.stack);
          if ('cause' in error) {
            console.error('错误原因:', error.cause);
          }
        }
        
        // 返回错误代码，让前端根据语言显示
        return res.status(500).json({
          error: 'SERVICE_UNAVAILABLE',
          model: 'replicate',
          imageUrl: ''
        } as ApiResponse);
      }
    }
    
    // 如果没有选择模型或模型不可用，返回错误
    if (!usedModel) {
      console.error('未选择有效的模型或模型不可用');
      let errorMessage = '证件照生成失败：未选择有效的模型';
      let suggestions: string[] = [];
      
      if (selectedModel === 'ark' && (!process.env.ARK_API_KEY || process.env.ARK_API_KEY === 'YOUR_ARK_API_KEY')) {
        errorMessage = '证件照生成失败：方舟SDK服务暂时不可用';
        suggestions.push('• 建议您：');
        suggestions.push('  1. 尝试切换到Replicate模型');
        suggestions.push('  2. 如果问题持续，请联系客服');
      } else if (selectedModel === 'replicate' && (!process.env.REPLICATE_API_KEY || process.env.REPLICATE_API_KEY === 'YOUR_REPLICATE_API_KEY')) {
        errorMessage = '证件照生成失败：Replicate服务暂时不可用';
        suggestions.push('• 建议您：');
        suggestions.push('  1. 尝试切换到方舟SDK模型');
        suggestions.push('  2. 如果问题持续，请联系客服');
      } else {
        suggestions.push('• 请选择一个可用的模型');
      }
      
      const fullError = suggestions.length > 0 
        ? `${errorMessage}\n\n建议：\n${suggestions.join('\n')}`
        : errorMessage;
      
      return res.status(400).json({
        error: fullError,
        imageUrl: ''
      } as ApiResponse);
    }
  } catch (error) {
    console.error('证件照生成错误:', error);
    
    // 最外层错误处理：返回通用错误信息（不暴露技术细节）
    return res.status(500).json({
      error: '证件照生成失败：服务暂时不可用\n\n建议：\n• 请检查网络连接\n• 尝试切换模型\n• 如果问题持续，请稍后再试或联系客服',
      imageUrl: ''
    } as ApiResponse);
  }
};

apiRoute.post(processRequest as any);

// 导出处理器
// 注意：我们需要根据请求类型决定是否禁用 bodyParser
// 对于 JSON 请求，需要启用 bodyParser；对于 multipart/form-data，需要禁用
const handler = apiRoute.handler();

// 配置：禁用 bodyParser，让中间件手动处理 JSON 和 multer 处理文件上传
export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;