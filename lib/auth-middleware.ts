import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

// 扩展 NextApiRequest 类型，添加 user 属性
export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email?: string;
    [key: string]: any;
  };
}

/**
 * 验证 token 格式（JWT token 应该是 base64url 编码的）
 * @param token - 待验证的 token
 * @returns 是否为有效的 token 格式
 */
function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // JWT token 格式：header.payload.signature（用 . 分隔）
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  // 检查每个部分是否只包含 base64url 字符（A-Z, a-z, 0-9, -, _）
  const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
  return parts.every(part => base64UrlRegex.test(part));
}

/**
 * 清理和验证 token
 * @param token - 原始 token
 * @returns 清理后的 token 或 null
 */
function cleanToken(token: string): string | null {
  if (!token || typeof token !== 'string') {
    return null;
  }
  
  // 移除前后空格
  let cleaned = token.trim();
  
  // 移除所有非 ASCII 字符（只保留 ASCII 字符 0-127）
  // JWT token 应该只包含 base64url 字符，不应该有非 ASCII 字符
  cleaned = cleaned.split('').filter(char => {
    const code = char.charCodeAt(0);
    return code >= 0 && code <= 127;
  }).join('');
  
  // 如果清理后为空，返回 null
  if (!cleaned) {
    return null;
  }
  
  // 验证格式
  if (!isValidTokenFormat(cleaned)) {
    return null;
  }
  
  return cleaned;
}

/**
 * 从请求中提取认证 token
 * @param req - Next.js API 请求对象
 * @returns 提取的 token，如果不存在或格式无效则返回 null
 */
function extractToken(req: NextApiRequest): string | null {
  // 只从 Authorization 请求头提取 token（最可靠的方法）
  // 禁用 cookie 提取，因为 cookie 中的 token 可能包含非 ASCII 字符导致 ByteString 错误
  const authHeader = req.headers.authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const rawToken = authHeader.substring(7).trim();
    const cleanedToken = cleanToken(rawToken);
    if (cleanedToken) {
      return cleanedToken;
    }
    // 如果清理失败，记录警告
    console.warn('Authorization header token cleaning failed - token may contain invalid characters');
    return null;
  }

  // 不再从 cookie 提取，避免非 ASCII 字符问题
  // 前端应该始终通过 Authorization header 发送 token
  return null;
}

/**
 * 验证并解析认证 token
 * @param req - Next.js API 请求对象
 * @param res - Next.js API 响应对象
 * @returns 解析后的用户信息，如果无效则返回 null
 */
export async function verifyAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<User | null> {
  try {
    const rawToken = extractToken(req);
    
    if (!rawToken) {
      return null;
    }

    // 再次清理 token，确保没有非 ASCII 字符
    const token = cleanToken(rawToken);
    
    if (!token) {
      console.warn('Token cleaning failed - token contains invalid characters');
      return null;
    }

    // 确保 token 格式正确（防止非 ASCII 字符）
    if (!isValidTokenFormat(token)) {
      console.warn('Invalid token format detected after cleaning');
      return null;
    }

    // 验证 token 只包含 ASCII 字符（额外检查）
    for (let i = 0; i < token.length; i++) {
      const code = token.charCodeAt(i);
      if (code > 127) {
        console.warn(`Token contains non-ASCII character at index ${i}: ${code}`);
        return null;
      }
    }

    // 使用 createServerClient 创建带有 token 的客户端
    // 这样可以避免直接传递 token 给 getUser，而是通过 headers 传递
    const clientWithToken = createServerClient(token);
    const { data: { user }, error } = await clientWithToken.auth.getUser();

    if (error) {
      // 记录错误但不暴露敏感信息
      console.warn('Token verification error:', error.message);
      return null;
    }

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    // 捕获所有错误，包括 ByteString 转换错误
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('verifyAuth error:', errorMessage);
    
    // 如果是 ByteString 转换错误，说明 token 格式有问题
    if (errorMessage.includes('ByteString') || errorMessage.includes('greater than 255')) {
      console.warn('Token contains invalid characters - this should have been caught by validation');
      // 尝试从 Authorization header 重新提取（如果之前是从 cookie 提取的）
      const authHeader = req.headers.authorization;
      if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const headerToken = authHeader.substring(7).trim();
        const cleanedHeaderToken = cleanToken(headerToken);
        if (cleanedHeaderToken && isValidTokenFormat(cleanedHeaderToken)) {
          console.info('Retrying with Authorization header token');
          try {
            const retryClient = createServerClient(cleanedHeaderToken);
            const { data: { user }, error } = await retryClient.auth.getUser();
            if (!error && user) {
              return user;
            }
          } catch (retryError) {
            // 重试也失败，返回 null
          }
        }
      }
    }
    
    return null;
  }
}

/**
 * 中间件：要求用户必须登录
 * 如果用户未登录，返回 401 错误
 * @param req - Next.js API 请求对象
 * @param res - Next.js API 响应对象
 * @param next - 下一个中间件函数（可选）
 */
export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  next?: () => void
): Promise<void> {
  const user = await verifyAuth(req, res);
  
  if (!user) {
    res.status(401).json({ 
      success: false,
      error: 'Unauthorized - Authentication required' 
    });
    return;
  }

  // 如果提供了 next 函数，调用它
  if (next) {
    next();
  }
}

/**
 * 中间件：将用户信息挂载到 req.user
 * 如果用户已登录，将用户信息附加到请求对象上
 * 如果用户未登录，req.user 保持为 undefined
 * @param req - Next.js API 请求对象（扩展为 AuthenticatedRequest）
 * @param res - Next.js API 响应对象
 * @param next - 下一个中间件函数（可选）
 */
export async function attachUser(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next?: () => void
): Promise<void> {
  const user = await verifyAuth(req, res);
  
  if (user) {
    req.user = {
      id: user.id,
      email: user.email,
      ...user.user_metadata
    };
  } else {
    req.user = undefined;
  }

  // 继续执行下一个中间件
  if (next) {
    next();
  }
}


