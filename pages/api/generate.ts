import { Ratelimit } from '@upstash/ratelimit';
import type { NextApiRequest, NextApiResponse } from 'next';
import redis from '../../utils/redis';
import { verifyAuth } from '../../lib/auth-middleware';
import prisma from '../../lib/prismadb';

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    imageUrl: string;
    model?: string;
  };
}

interface ApiResponse {
  imageUrl?: string;
  usedModel?: string;
  error?: string;
  message?: string;
  modelSwitchInfo?: string;
}

// Create a new ratelimiter, that allows 2 requests per day
const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.fixedWindow(2, '1440 m'),
      analytics: true,
    })
  : undefined;

// 调用方舟SDK修复图片
async function callArkSDK(imageUrl: string): Promise<{ success: boolean; result?: string; error?: string }> {
  console.log('===== 调用方舟SDK开始 =====');
  
  // 检查方舟SDK API密钥
  if (!process.env.ARK_API_KEY || process.env.ARK_API_KEY === 'YOUR_ARK_API_KEY') {
    console.error('方舟SDK API密钥未配置');
    return { success: false, error: '方舟SDK服务暂时不可用' };
  }
  
  // 开发环境优化：简化API密钥验证逻辑，允许即使没有密钥也能提供模拟响应
  const isDev = process.env.NODE_ENV === 'development';
  let retryCount = 0;
  const maxRetries = isDev ? 1 : 2; // 开发环境少重试，生产环境多重试
  
  while (retryCount <= maxRetries) {
    try {
        // 构建方舟SDK请求参数
        // 使用最简化的prompt，避免触发敏感内容检测误判
        // 移除可能触发检测的词汇：如"真实"、"完整"、"主体"等
        const prompt = `【背景要求 — 强制】

背景保持原样，不新增、不替换、不改动、不重绘

禁止生成任何新的不符合时代背景的建筑、室内外场景、光效、物体等

只允许清理背景上的污渍、噪点、老化痕迹和破损等，不做创作性补全

不扩展、不延展、不添加不应该存在的区域

【修复要求】

完全去除：老化感、泛黄、褪色、灰蒙、污渍、斑点、划痕、裂纹、噪点、相纸纹理

不使用复古、胶片、怀旧风格

恢复自然真实的肤色与光影

整体效果清晰、干净、现代、自然

【人物要求】

人物面部结构保持一致，不重绘、不美化、不改变年龄或性别特征

保留真实皮肤纹理，不磨皮、不过度锐化

只做必要的修复与色彩还原

【画面要求】

不改变构图

不裁切、不拉伸、不改变主体内容

不添加额外元素（如光晕、颗粒、滤镜等）

【目标效果】

输出一张 干净、自然、无老化痕迹 的真实照片。
                        `;
        
        // 使用英文prompt，减少中文可能引起的误判
        const fullPrompt = prompt;
      
      const requestData = {
        model: "doubao-seedream-4-0-250828",
        prompt: fullPrompt,
        image: imageUrl, // 图生图时提供公网可达 URL
        size: "2K", // 支持 "2K"/"4K" 或 "WxH" 格式
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
      
      // 检查 DataURL 大小（base64 编码会增加约 33% 的大小）
      const imageDataSize = requestData.image ? requestData.image.length : 0;
      if (imageDataSize > 20 * 1024 * 1024) { // 约 15MB 原始图片（20MB base64）
        console.warn(`警告: DataURL 大小较大 (${(imageDataSize / 1024 / 1024).toFixed(2)}MB)，可能导致请求失败`);
      }
      
      // 使用方舟SDK官方API端点（根据证件照生成API的实现）
      // 增加超时时间到 120 秒，因为处理大图片需要更长时间
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒超时
      
      // 更新为正确的端点
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
      
      const startTime = Date.now();
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
      const endTime = Date.now();
      console.log(`方舟SDK请求完成，耗时: ${endTime - startTime}ms`);
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
          // 检查是否是敏感内容检测错误
          if (errorCode === 'InputImageSensitiveContentDetected') {
            errorMessage = '图片内容检测：系统检测到图片可能包含敏感内容，无法进行处理。请尝试使用其他图片。\nImage content detected: The system detected that the image may contain sensitive content and cannot be processed. Please try using a different image.';
          } else if (errorCode === 'InputTextSensitiveContentDetected') {
            errorMessage = '提示词检测：系统检测到提示词可能包含敏感内容。请尝试使用其他图片或联系客服。\nText content detected: The system detected that the prompt may contain sensitive content. Please try using a different image or contact support.';
          } else if (errorCode === 'OutputImageSensitiveContentDetected' || 
                     (typeof errorDetailText === 'string' && errorDetailText.toLowerCase().includes('output image') && errorDetailText.toLowerCase().includes('sensitive'))) {
            // 输出图片敏感内容检测错误 - 这是误判，不重试方舟SDK，直接切换到Replicate
            const sensitiveError = new Error('OUTPUT_SENSITIVE_DETECTED');
            (sensitiveError as any).isSensitiveContentError = true;
            throw sensitiveError; // 立即抛出，不重试
          } else {
            errorMessage = `方舟SDK API请求格式错误: ${errorDetailText.substring(0, 200)}\nRequest format error: Please check request parameters`;
          }
        } else if (response.status === 413) {
          errorMessage = '方舟SDK API请求体过大：图片太大，请压缩后重试\nRequest too large: Please compress the image';
        } else if (response.status === 429) {
          errorMessage = '方舟SDK API请求频率限制：请稍后再试\nRate limit exceeded: Please try again later';
        } else if (response.status >= 500) {
          errorMessage = '方舟SDK服务器错误：服务暂时不可用，请稍后再试\nServer error: Service temporarily unavailable';
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
      } else if (responseData && responseData.url) {
        // 兼容直接返回 url 的情况
        generatedImageUrl = responseData.url;
        if (generatedImageUrl) {
          console.log('从响应根对象提取 URL:', generatedImageUrl.substring(0, 150));
        }
      } else if (responseData && responseData.code === 0 && responseData.data && responseData.data.image_url) {
        // 兼容旧版响应格式
        generatedImageUrl = responseData.data.image_url;
        if (generatedImageUrl) {
          console.log('从旧版响应格式提取 URL:', generatedImageUrl.substring(0, 150));
        }
      }
      
      if (generatedImageUrl) {
        console.log(`方舟SDK生成完成，耗时: ${endTime - startTime}ms`);
        console.log('最终生成的图片URL:', generatedImageUrl.substring(0, 150));
        return { success: true, result: generatedImageUrl };
      } else {
        console.error('无法从响应中提取图片URL，响应数据:', JSON.stringify(responseData, null, 2));
        throw new Error('方舟SDK返回了无效的输出格式：响应中未找到 data 数组或 url 字段');
      }
    } catch (error) {
      // 检查是否是敏感内容检测错误，如果是则不重试，直接返回
      if (error instanceof Error && (error as any).isSensitiveContentError) {
        console.warn('检测到输出图片敏感内容误判，跳过重试，将切换到Replicate');
        return { 
          success: false, 
          error: 'OUTPUT_SENSITIVE_DETECTED',
          shouldSwitchToReplicate: true 
        } as any;
      }
      
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
      } else if (error instanceof TypeError && error.message.includes('fetch failed')) {
        // 网络错误处理
        if ('cause' in error && error.cause && typeof error.cause === 'object' && 'code' in error.cause) {
          const errorCode = error.cause.code;
          console.error('网络连接错误代码:', errorCode);
          if (errorCode === 'ENOTFOUND') {
            console.error('DNS解析失败：无法解析 ark.cn-beijing.volces.com，请检查网络连接或DNS配置');
          } else if (errorCode === 'ECONNREFUSED') {
            console.error('连接被拒绝：API服务器可能不可用');
          } else if (errorCode === 'ETIMEDOUT') {
            console.error('连接超时：网络延迟过高');
          } else {
            console.error('其他网络错误:', errorCode);
          }
        } else {
          console.error('未知网络错误');
        }
      }
      
      retryCount++;
      
      // 如果未达到最大重试次数，等待一段时间后重试
      if (retryCount <= maxRetries) {
        const waitTime = 1000 * Math.pow(2, retryCount - 1); // 指数退避策略
        console.log(`等待${waitTime}ms后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        // 所有重试都失败了
        let errorMsg = '方舟SDK服务暂时不可用';
        if (error instanceof Error) {
          if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            // 不暴露技术细节
            errorMsg = '方舟SDK服务暂时不可用';
          }
          // 不将详细错误消息传递给前端
        }
        return { success: false, error: errorMsg };
      }
    }
  }
  
  // 如果所有重试都失败（理论上不应该到达这里，但为了类型安全）
  return { success: false, error: '方舟SDK调用失败：未知错误' };
}

// 调用Replicate修复图片
async function callReplicate(imageUrl: string): Promise<{ success: boolean; result?: string; error?: string }> {
  console.log('===== 调用Replicate开始 =====');
  
  // 检查Replicate API密钥
  const replicateApiKey = process.env.REPLICATE_API_KEY;
  console.log('Replicate API Key 检查:');
  console.log('  - 环境变量存在:', !!replicateApiKey);
  console.log('  - API Key 长度:', replicateApiKey?.length || 0);
  console.log('  - API Key 前缀:', replicateApiKey?.substring(0, 10) || 'N/A');
  console.log('  - API Key 后缀:', replicateApiKey?.substring(replicateApiKey.length - 5) || 'N/A');
  console.log('  - 是否为默认值:', replicateApiKey === 'YOUR_REPLICATE_API_KEY');
  console.log('  - 是否包含空格:', replicateApiKey?.includes(' ') || false);
  console.log('  - 是否包含换行符:', replicateApiKey?.includes('\n') || replicateApiKey?.includes('\r') || false);
  
  if (!replicateApiKey || replicateApiKey === 'YOUR_REPLICATE_API_KEY' || replicateApiKey.trim() === '') {
    console.error('Replicate API密钥未配置或无效');
    console.error('请检查环境变量 REPLICATE_API_KEY 是否正确设置');
    return { success: false, error: 'Replicate服务暂时不可用' };
  }
  
  // 清理 API Key（移除可能的空格和换行符）
  const cleanedApiKey = replicateApiKey.trim().replace(/\s+/g, '');
  if (cleanedApiKey !== replicateApiKey) {
    console.warn('警告：API Key 包含空格或换行符，已自动清理');
    console.warn('  - 原始长度:', replicateApiKey.length);
    console.warn('  - 清理后长度:', cleanedApiKey.length);
  }
  
  // 尝试使用简单的 API 端点验证 API Key（可选，用于调试）
  // 注意：这会增加一次额外的 API 调用，仅用于诊断
  if (process.env.NODE_ENV === 'development') {
    try {
      const testResponse = await fetch('https://api.replicate.com/v1/account', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cleanedApiKey}`,
        },
      });
      console.log('Replicate API Key 验证测试:');
      console.log('  - 测试端点响应状态:', testResponse.status);
      if (testResponse.status === 401) {
        console.error('  - ⚠️ API Key 验证失败：Key 可能已过期或被撤销');
        console.error('  - 建议：请在 Replicate 网站 (https://replicate.com) 重新生成 API Key');
      } else if (testResponse.status === 200) {
        console.log('  - ✓ API Key 验证成功');
      }
    } catch (testError) {
      console.warn('  - API Key 验证测试失败（不影响主流程）:', testError instanceof Error ? testError.message : '未知错误');
    }
  }
  
  // 开发环境优化
  const isDev = process.env.NODE_ENV === 'development';
  let retryCount = 0;
  const maxRetries = isDev ? 1 : 2; // 开发环境少重试，生产环境多重试
  
  while (retryCount <= maxRetries) {
    try {
      // 构建请求参数（参考证件照生成API的格式）
      // 添加正向提示词参数，确保图片完整性
      // 注意：根据 Replicate 文档，restore-image 模型可能不支持 prompt 参数
      // 如果遇到错误，可以尝试移除 prompt 参数
      const requestData = {
        input: { 
          input_image: imageUrl, 
          output_format: 'png', 
          safety_tolerance: 2
          // 暂时移除 prompt 参数，因为 restore-image 模型可能不支持
          // prompt: '专业照片修复和色彩还原，高清细节，自然真实的色彩还原，准确还原原始色彩和色调，保持照片的原始风格和时代特征，现代感处理，去除老化痕迹，修复划痕和破损，增强清晰度，保持照片完整性，不裁切，完整保留原图主体内容'
        },
      };
      
      console.log(`开始调用Replicate API... (尝试 ${retryCount + 1}/${maxRetries + 1})`);
      console.log('Replicate请求参数:', {
        input: {
          input_image: requestData.input.input_image ? (requestData.input.input_image.length > 100 ? requestData.input.input_image.substring(0, 100) + '... (URL, 长度: ' + requestData.input.input_image.length + ')' : requestData.input.input_image) : '无',
          output_format: requestData.input.output_format,
          safety_tolerance: requestData.input.safety_tolerance
        }
      });
      
      const modelId = 'flux-kontext-apps/restore-image';
      const apiUrl = 'https://api.replicate.com/v1/models/flux-kontext-apps/restore-image/predictions';
      
      // 添加超时设置 - 120秒超时（参考证件照生成API的实现）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('Replicate API请求超时 (120秒)');
        controller.abort();
      }, 120000); // 120秒超时
      
      const startTime = Date.now();
      
      // 构建 Authorization header（使用清理后的 API Key）
      const authHeader = `Bearer ${cleanedApiKey}`;
      console.log('Replicate API 请求详情:');
      console.log('  - API URL:', apiUrl);
      console.log('  - Authorization Header 前缀:', authHeader.substring(0, 20) + '...');
      console.log('  - API Key 格式检查:', cleanedApiKey.startsWith('r8_') ? '✓ 正确格式 (r8_开头)' : '✗ 可能格式错误 (应以 r8_ 开头)');
      console.log('  - 使用的 API Key 长度:', cleanedApiKey.length);
      
      let startResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          'Prefer': 'wait'
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      console.log(`Replicate API请求完成，耗时: ${endTime - startTime}ms`);
      console.log('Replicate API响应状态:', startResponse.status, startResponse.statusText);
      
      if (!startResponse.ok) {
        console.error(`Replicate API错误: ${startResponse.status} ${startResponse.statusText}`);
        // 记录响应内容以便调试
        let errorBody: string;
        let errorData: any;
        try {
          errorBody = await startResponse.text();
          try {
            errorData = JSON.parse(errorBody);
          } catch {
            errorData = { message: errorBody };
          }
        } catch {
          errorBody = '无法读取错误响应';
          errorData = {};
        }

        console.error('Replicate错误响应内容:', errorBody);

        // 解析错误码和消息
        const errorDetail = errorData?.error || errorData?.detail || errorData?.message || errorBody;
        const errorDetailText = typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail);

        console.log('Replicate错误详情:', errorDetailText);

        // 根据状态码提供更具体的错误信息（双语排查提示）
        let errorMessage = `Replicate服务错误: ${startResponse.status}`;
        if (startResponse.status === 401) {
          console.error('Replicate API 认证失败详情:');
          console.error('  - API Key 是否存在:', !!replicateApiKey);
          console.error('  - API Key 长度:', replicateApiKey?.length || 0);
          console.error('  - API Key 格式检查:', replicateApiKey?.startsWith('r8_') ? '✓ 正确格式 (r8_开头)' : '✗ 格式错误 (应以 r8_ 开头)');
          console.error('  - API Key 前缀:', replicateApiKey?.substring(0, 10) || 'N/A');
          console.error('  - 错误响应:', errorDetailText);
          errorMessage = 'Replicate服务认证失败';
        } else if (startResponse.status === 403) {
          errorMessage = 'Replicate服务权限不足';
        } else if (startResponse.status === 400 || startResponse.status === 422) {
          errorMessage = `Replicate API请求格式错误: ${errorDetailText.substring(0, 200)}\nRequest format error: Please check request parameters`;
        } else if (startResponse.status === 413) {
          errorMessage = 'Replicate API请求体过大：图片太大，请压缩后重试\nRequest too large: Please compress the image';
        } else if (startResponse.status === 429) {
          errorMessage = 'Replicate API请求频率限制：请稍后再试\nRate limit exceeded: Please try again later';
        } else if (startResponse.status >= 500) {
          errorMessage = 'Replicate服务器错误：服务暂时不可用，请稍后再试\nServer error: Service temporarily unavailable';
        }

        throw new Error(errorMessage);
      }
      
      let jsonStartResponse = await startResponse.json();
      console.log('Replicate API响应数据:', JSON.stringify(jsonStartResponse).substring(0, 500));
      console.log('响应内容类型:', startResponse.headers.get('content-type'));
      
      // 检查响应中是否包含output字段
      let restoredImage: string | null = null;
      
      // 直接从响应中提取output（参考证件照生成API的响应处理逻辑）
      if (jsonStartResponse.output) {
        if (typeof jsonStartResponse.output === 'string') {
          restoredImage = jsonStartResponse.output;
          if (restoredImage) {
            console.log('从响应中提取字符串URL:', restoredImage.substring(0, 150));
          }
        } else if (jsonStartResponse.output.url) {
          restoredImage = jsonStartResponse.output.url;
          if (restoredImage) {
            console.log('从响应中提取URL字段:', restoredImage.substring(0, 150));
          }
        } else if (Array.isArray(jsonStartResponse.output) && jsonStartResponse.output.length > 0) {
          // 兼容数组格式的输出
          const firstOutput = jsonStartResponse.output[0];
          if (typeof firstOutput === 'string') {
            restoredImage = firstOutput;
          } else if (firstOutput?.url) {
            restoredImage = firstOutput.url;
          }
          console.log('从响应中提取数组URL:', restoredImage?.substring(0, 150));
        } else if (typeof jsonStartResponse.output === 'object') {
          // 尝试提取其他可能的URL字段
          const possibleUrlFields = ['image', 'image_url', 'result', 'output_url'];
          for (const field of possibleUrlFields) {
            if (jsonStartResponse.output[field]) {
              restoredImage = jsonStartResponse.output[field];
              if (restoredImage) {
                console.log(`从响应中提取${field}字段:`, restoredImage.substring(0, 150));
              }
              break;
            }
          }
        } else {
          // 兜底处理
          restoredImage = JSON.stringify(jsonStartResponse.output);
          console.warn('Replicate返回了非标准格式');
        }
      }
      
      if (!restoredImage) {
        console.error('无法从Replicate响应中提取输出，完整响应:', JSON.stringify(jsonStartResponse, null, 2));
        throw new Error('无法从Replicate响应中提取结果：输出格式不匹配预期');
      }
      
      // 验证URL格式
      if (restoredImage && (restoredImage.startsWith('http://') || restoredImage.startsWith('https://') || restoredImage.startsWith('data:image/'))) {
        console.log(`Replicate修复完成，耗时: ${endTime - startTime}ms`);
        console.log('最终生成的图片URL:', restoredImage.substring(0, 150));
        return { success: true, result: restoredImage };
      } else {
        console.error('Replicate返回的URL格式无效:', restoredImage);
        throw new Error('Replicate返回了无效的图片URL格式');
      }
    } catch (error) {
      // 详细的错误日志
      console.error(`Replicate API调用失败 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, error);
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
        console.error('Replicate API请求超时 - 可能原因：1) 图片太大 2) 网络慢 3) 服务器处理时间长');
      } else if (error instanceof TypeError && error.message.includes('fetch failed')) {
        // 网络错误处理
        if ('cause' in error && error.cause && typeof error.cause === 'object' && 'code' in error.cause) {
          const errorCode = error.cause.code;
          console.error('网络连接错误代码:', errorCode);
          if (errorCode === 'ENOTFOUND') {
            console.error('DNS解析失败：无法解析 api.replicate.com，请检查网络连接或DNS配置');
          } else if (errorCode === 'ECONNREFUSED') {
            console.error('连接被拒绝：API服务器可能不可用');
          } else if (errorCode === 'ETIMEDOUT') {
            console.error('连接超时：网络延迟过高');
          } else {
            console.error('其他网络错误:', errorCode);
          }
        } else {
          console.error('未知网络错误');
        }
      }
      
      retryCount++;
      
      // 如果未达到最大重试次数，等待一段时间后重试
      if (retryCount <= maxRetries) {
        const waitTime = 1000 * Math.pow(2, retryCount - 1); // 指数退避策略
        console.log(`等待${waitTime}ms后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        // 所有重试都失败了
        let errorMsg = 'Replicate服务暂时不可用';
        if (error instanceof Error) {
          if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            // 不暴露技术细节
            errorMsg = 'Replicate服务暂时不可用';
          }
          // 不将详细错误消息传递给前端
        }
        return { success: false, error: errorMsg };
      }
    }
  }
  
  // 如果所有重试都失败（理论上不应该到达这里，但为了类型安全）
  return { success: false, error: 'Replicate调用失败：未知错误' };
}

export default async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse<ApiResponse | string>
) {
  console.log('===== 照片修复 API 请求开始 =====');
  console.log('请求方法:', req.method);
  console.log('请求时间:', new Date().toISOString());
  
  // 获取请求参数
  const { imageUrl, model: requestedModel } = req.body;
  
  // 验证图片URL
  if (!imageUrl) {
    console.error('错误: 缺少图片URL参数');
    return res.status(400).json('错误: 缺少图片URL参数');
  }
  
  // 确定使用的模型 - 修改默认模型为Replicate，因为方舟SDK存在网络问题
  const selectedModel = requestedModel || 'replicate'; // 默认使用Replicate
  console.log('请求的模型:', selectedModel);
  
  // 保存用户信息，用于后续积分扣除
  let authenticatedUser: { id: string } | null = null;
  
  // 检查用户登录状态和积分（在开始处理之前）
  try {
    const user = await verifyAuth(req, res);
    if (!user) {
      // 用户未登录，返回错误并停止API调用
      console.warn('用户未登录，无法生成照片');
      return res.status(401).json({
        error: 'UNAUTHORIZED'
      });
    }
    
    // 保存用户信息，用于后续积分扣除
    authenticatedUser = { id: user.id };
    
    const userRecord = await (prisma.user.findUnique as any)({
      where: { id: user.id },
      select: { credits: true }
    });

    const currentCredits = userRecord?.credits || 0;
    
    if (currentCredits < 1) {
      console.warn('用户积分不足，无法生成照片');
      return res.status(400).json({
        error: 'INSUFFICIENT_CREDITS'
      });
    }
  } catch (creditCheckError: any) {
    // 如果是列不存在错误（P2022），允许继续（兼容旧数据库）
    if (creditCheckError?.code === 'P2022' || creditCheckError?.message?.includes('does not exist')) {
      console.warn('Credits column does not exist, skipping credit check');
      // 即使列不存在，仍然需要检查登录状态
      const user = await verifyAuth(req, res);
      if (!user) {
        return res.status(401).json({
          error: 'UNAUTHORIZED'
        });
      }
      authenticatedUser = { id: user.id };
    } else {
      // 其他错误（如未登录）返回错误
      console.log('Credit check failed:', creditCheckError);
      return res.status(401).json({
        error: 'UNAUTHORIZED'
      });
    }
  }
  
  // 检查速率限制
  const isDev = process.env.NODE_ENV === 'development';
  const identifier = 'anonymous_user';
  
  if (ratelimit && !isDev) {
    console.log('检查速率限制...');
    const result = await ratelimit.limit(identifier);
    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);

    if (!result.success) {
      console.warn('速率限制：已达到每日限制');
      return res.status(429).json(`您的生成次数将在 ${Math.ceil(result.reset / 3600000)} 小时后重置。`);
    }
  }
  
  // 检查图片大小
  const imageDataSize = imageUrl ? imageUrl.length : 0;
  if (imageDataSize > 20 * 1024 * 1024) { // 约 15MB 原始图片（20MB base64）
    console.warn(`警告: DataURL 大小较大 (${(imageDataSize / 1024 / 1024).toFixed(2)}MB)`);
  }
  
  const startTime = Date.now();
  let finalResult: { imageUrl: string; usedModel: string } | null = null;
  
  try {
    // 只调用用户选择的模型，不自动切换
    if (selectedModel === 'ark') {
      const arkResult = await callArkSDK(imageUrl);
      
      if (arkResult.success && arkResult.result) {
        finalResult = {
          imageUrl: arkResult.result,
          usedModel: '方舟SDK'
        };
      } else {
        // 方舟SDK调用失败，给出错误提示和建议
        const errorMessage = arkResult.error || '未知错误';
        const isSensitiveError = (arkResult as any).shouldSwitchToReplicate === true;
        
        let fullErrorMessage = '照片修复失败：方舟SDK调用失败';
        let suggestions: string[] = [];
        
        // 返回错误代码，让前端根据语言显示
        return res.status(500).json(JSON.stringify({
          error: 'SERVICE_UNAVAILABLE',
          model: 'ark'
        }));
      }
    } else {
      // 使用Replicate模型
      const replicateResult = await callReplicate(imageUrl);
      
      if (replicateResult.success && replicateResult.result) {
        finalResult = {
          imageUrl: replicateResult.result,
          usedModel: 'Replicate'
        };
      } else {
        // Replicate调用失败，给出错误提示和建议
        const errorMessage = replicateResult.error || '未知错误';
        const isAuthFailed = errorMessage.includes('认证失败') || errorMessage.includes('Authentication failed');
        
        let fullErrorMessage = '照片修复失败：Replicate服务暂时不可用';
        let suggestions: string[] = [];
        
        // 返回错误代码，让前端根据语言显示
        return res.status(500).json({
          error: 'SERVICE_UNAVAILABLE',
          model: 'replicate'
        });
      }
    }
    
    const endTime = Date.now();
    console.log(`照片修复完成，耗时: ${endTime - startTime}ms`);
    console.log('使用模型:', finalResult.usedModel);
    if (finalResult.imageUrl) {
      console.log('最终返回的图片URL:', finalResult.imageUrl.substring(0, 150));
    }
    
    // 扣除积分（只有在图片生成成功后才扣除）
    try {
      // 使用之前保存的用户信息，避免重复调用 verifyAuth
      if (authenticatedUser && finalResult && finalResult.imageUrl) {
        // 只有在成功生成图片后才扣除积分
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
              description: '照片修复'
            }
          });
        });
        console.log('积分扣除成功（照片生成成功），用户ID:', userId);
      } else if (!authenticatedUser) {
        console.log('用户未登录，跳过积分扣除');
      }
    } catch (creditError: any) {
      // 积分扣除失败不影响照片生成结果，只记录错误
      // 如果是列不存在错误（P2022），静默处理
      if (creditError?.code === 'P2022' || creditError?.message?.includes('does not exist')) {
        console.warn('Credits column does not exist in database, skipping credit deduction');
      } else {
        console.error('扣除积分时出错:', creditError);
      }
    }
    
    console.log('===== 照片修复请求完成 =====');
    
    // 返回完整的响应对象
    res.status(200).json(finalResult);
  } catch (error) {
    console.error('照片修复API调用异常:', error);
    
    // 返回通用错误信息（不暴露技术细节）
    return res.status(500).json('照片修复失败：服务暂时不可用\n\n建议：\n• 请检查网络连接\n• 尝试切换模型\n• 如果问题持续，请稍后再试或联系客服');
  }
}
