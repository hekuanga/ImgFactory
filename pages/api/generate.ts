import { Ratelimit } from '@upstash/ratelimit';
import type { NextApiRequest, NextApiResponse } from 'next';
import redis from '../../utils/redis';

type Data = string;
interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    imageUrl: string;
  };
}

// Create a new ratelimiter, that allows 2 requests per day
const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.fixedWindow(2, '1440 m'),
      analytics: true,
    })
  : undefined;

export default async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log('===== 照片修复 API 请求开始 =====');
  console.log('请求方法:', req.method);
  console.log('请求时间:', new Date().toISOString());
  
  // 检查Replicate API密钥配置
  const isDev = process.env.NODE_ENV === 'development';
  if (!process.env.REPLICATE_API_KEY || process.env.REPLICATE_API_KEY === 'YOUR_REPLICATE_API_KEY') {
    console.error('REPLICATE_API_KEY 未配置或使用了默认值');
    if (isDev) {
      return res.status(200).json('开发模式：请配置 REPLICATE_API_KEY 环境变量。在项目根目录创建 .env.local 文件，添加：REPLICATE_API_KEY=your_api_key_here');
    }
    return res.status(500).json('Replicate API密钥未配置或使用了默认值。请在.env文件中设置有效的API密钥。');
  }
  
  console.log('API 密钥检查: 已配置 (长度:', process.env.REPLICATE_API_KEY?.length || 0, ')');
  
  // 移除登录验证，使用默认identifier进行速率限制
  const identifier = 'anonymous_user';
  
  // Rate Limiting
  if (ratelimit) {
    console.log('检查速率限制...');
    const result = await ratelimit.limit(identifier!);
    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);

    // Calcualte the remaining time until generations are reset
    const diff = Math.abs(
      new Date(result.reset).getTime() - new Date().getTime()
    );
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor(diff / 1000 / 60) - hours * 60;

    console.log('速率限制结果:', {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      resetIn: `${hours}小时${minutes}分钟`
    });

    if (!result.success) {
      console.warn('速率限制：已达到每日限制');
      return res
        .status(429)
        .json(
          `您的生成次数将在 ${hours} 小时和 ${minutes} 分钟后重置。如有任何问题，请发送电子邮件至 hassan@hey.com。`
        );
    }
  } else {
    console.log('速率限制: 未配置 Redis，跳过速率限制检查');
  }

  const imageUrl = req.body.imageUrl;
  const startTime = Date.now();
  
  // 检查 DataURL 大小
  const imageDataSize = imageUrl ? imageUrl.length : 0;
  if (imageDataSize > 10 * 1024 * 1024) { // 约 7.5MB 原始图片
    console.warn(`警告: DataURL 大小较大 (${(imageDataSize / 1024 / 1024).toFixed(2)}MB)，可能导致请求失败`);
  }
  
  // 构建请求参数
  const requestData = {
    input: { 
      input_image: imageUrl, 
      output_format: 'png', 
      safety_tolerance: 2 
    },
  };
  
  const modelId = 'flux-kontext-apps/restore-image';
  const apiUrl = 'https://api.replicate.com/v1/models/flux-kontext-apps/restore-image/predictions';
  
  console.log('===== 开始照片修复请求 =====');
  console.log('使用模型:', modelId);
  console.log('API URL:', apiUrl);
  console.log('API 密钥长度:', process.env.REPLICATE_API_KEY?.length || 0);
  console.log('请求参数:', {
    model: modelId,
    input_image: imageUrl ? (imageUrl.length > 100 ? imageUrl.substring(0, 100) + '... (DataURL, 长度: ' + imageUrl.length + ')' : imageUrl) : '无',
    output_format: requestData.input.output_format,
    safety_tolerance: requestData.input.safety_tolerance
  });
  console.log('DataURL 大小:', (imageDataSize / 1024 / 1024).toFixed(2), 'MB');
  
  // 添加超时设置
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.error('Replicate API 请求超时 (120秒)');
    controller.abort();
  }, 120000); // 120秒超时
  
  try {
    // POST request to Replicate to start the image restoration generation process
    let startResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.REPLICATE_API_KEY,
        'Prefer': 'wait'
      },
      body: JSON.stringify(requestData),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('Replicate API 响应状态:', startResponse.status, startResponse.statusText);
    console.log('Replicate API 响应头:', Object.fromEntries(startResponse.headers.entries()));

    let jsonStartResponse = await startResponse.json();
    console.log('Replicate API 响应数据:', JSON.stringify(jsonStartResponse, null, 2).substring(0, 500));
    
    // 添加错误处理，检查response状态和数据格式
    if (!startResponse.ok) {
      console.error('Replicate API 错误:', jsonStartResponse);
      
      // 根据状态码提供更具体的错误信息
      let errorMessage = `Replicate API错误: ${startResponse.status} ${startResponse.statusText}`;
      if (startResponse.status === 401) {
        errorMessage = 'Replicate API认证失败：请检查 REPLICATE_API_KEY 是否正确';
        console.error('API 认证失败：请检查环境变量中的 REPLICATE_API_KEY');
      } else if (startResponse.status === 400) {
        const errorDetail = jsonStartResponse.error || jsonStartResponse.detail || '请求格式错误';
        errorMessage = `Replicate API请求格式错误: ${typeof errorDetail === 'string' ? errorDetail.substring(0, 200) : JSON.stringify(errorDetail).substring(0, 200)}`;
        console.error('请求格式错误详情:', errorDetail);
      } else if (startResponse.status === 413) {
        errorMessage = 'Replicate API请求体过大：图片太大，请压缩后重试';
        console.error('请求体过大：DataURL 太大');
      } else if (startResponse.status === 429) {
        errorMessage = 'Replicate API请求频率限制：请稍后再试';
        console.error('请求频率限制：已达到 API 调用限制');
      } else if (startResponse.status >= 500) {
        errorMessage = 'Replicate服务器错误：服务暂时不可用，请稍后再试';
        console.error('服务器错误：Replicate 服务暂时不可用');
      }
      
      return res.status(startResponse.status).json(errorMessage);
    }
    
    // 检查响应中是否包含output字段
    let restoredImage: string | null = null;
    
    console.log('Replicate 输出类型:', typeof jsonStartResponse.output);
    console.log('Replicate 输出内容:', jsonStartResponse.output ? (typeof jsonStartResponse.output === 'string' ? jsonStartResponse.output.substring(0, 100) + '...' : JSON.stringify(jsonStartResponse.output).substring(0, 200)) : 'null');
    
    // 直接从响应中提取output
    if (jsonStartResponse.output) {
      // 新模型可能返回不同格式的output
      if (typeof jsonStartResponse.output === 'string') {
        restoredImage = jsonStartResponse.output;
        console.log('Replicate返回字符串URL:', restoredImage.substring(0, 150));
      } else if (jsonStartResponse.output.url) {
        restoredImage = jsonStartResponse.output.url;
        console.log('Replicate返回对象URL:', restoredImage.substring(0, 150));
      } else {
        // 尝试字符串化输出以捕获其他格式
        restoredImage = JSON.stringify(jsonStartResponse.output);
        console.warn('Replicate返回了非标准格式，已转换为字符串:', restoredImage.substring(0, 200));
      }
    }
    
    if (!restoredImage) {
      console.error('无法从响应中提取输出:', jsonStartResponse);
      return res.status(500).json('修复图像失败：无法从API响应中提取结果');
    }
    
    const endTime = Date.now();
    console.log(`照片修复完成，耗时: ${endTime - startTime}ms`);
    console.log('最终返回的图片URL:', restoredImage.substring(0, 150));
    console.log('===== 照片修复请求完成 =====');
    
    res.status(200).json(restoredImage);
  } catch (error) {
    clearTimeout(timeoutId);
    
    // 详细的错误日志
    console.error('照片修复 API 调用失败:', error);
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
      console.error('Replicate API 请求超时 - 可能原因：1) 图片太大 2) 网络慢 3) 服务器处理时间长');
      return res.status(200).json('请求超时：处理大图片需要更长时间，请稍后重试或使用较小的图片');
    } else if (error instanceof TypeError && error.message.includes('fetch failed')) {
      // 网络错误处理
      if ('cause' in error && error.cause && typeof error.cause === 'object' && 'code' in error.cause) {
        const errorCode = error.cause.code;
        console.error('网络连接错误代码:', errorCode);
        if (errorCode === 'ENOTFOUND') {
          console.error('DNS解析失败：无法解析 api.replicate.com，请检查网络连接或DNS配置');
          return res.status(200).json('网络连接错误：无法连接到 Replicate 服务器，请检查网络连接');
        } else if (errorCode === 'ECONNREFUSED') {
          console.error('连接被拒绝：API服务器可能不可用');
          return res.status(200).json('Replicate 服务器连接被拒绝，请稍后再试');
        } else if (errorCode === 'ETIMEDOUT') {
          console.error('连接超时：网络延迟过高');
          return res.status(200).json('网络连接超时，请检查网络连接');
        }
      }
      return res.status(200).json('网络请求失败：与 Replicate 服务器通信时出现问题');
    } else {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('其他错误类型:', error);
      return res.status(200).json(`照片修复失败: ${errorMsg.substring(0, 100)}`);
    }
  }
}
