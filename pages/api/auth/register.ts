import type { NextApiRequest, NextApiResponse } from 'next';
import { signUp } from '../../../services/auth';
import type { SignUpResponse } from '../../../services/auth';
import prisma from '../../../lib/prismadb';

// 注册请求体类型
interface RegisterRequest extends NextApiRequest {
  body: {
    email: string;
    password: string;
    metadata?: {
      name?: string;
      [key: string]: any;
    };
  };
}

// 注册响应类型
type RegisterResponse = {
  success: boolean;
  user?: {
    id: string;
    email?: string;
    [key: string]: any;
  };
  session?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    [key: string]: any;
  };
  error?: string;
  message?: string;
};

export default async function handler(
  req: RegisterRequest,
  res: NextApiResponse<RegisterResponse>
) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { email, password, metadata } = req.body;

    // 验证请求参数
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // 调用 auth service 注册函数
    const result: SignUpResponse = await signUp({
      email,
      password,
      metadata
    });

    // 处理注册结果
    if (result.error) {
      // 根据错误类型返回相应的状态码
      const statusCode = result.error.name === 'ValidationError' ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        error: result.error.message || 'Registration failed'
      });
    }

    // 注册成功
    if (result.user && result.session) {
      // 同步创建 Prisma User 记录
      try {
        await prisma.user.upsert({
          where: { id: result.user.id },
          update: {
            email: result.user.email || email,
            emailVerified: result.user.email_confirmed_at ? true : false,
            name: result.user.user_metadata?.name || metadata?.name || null,
            image: result.user.user_metadata?.avatar_url || null,
          },
          create: {
            id: result.user.id,
            email: result.user.email || email,
            emailVerified: result.user.email_confirmed_at ? true : false,
            name: result.user.user_metadata?.name || metadata?.name || null,
            image: result.user.user_metadata?.avatar_url || null,
          },
        });
      } catch (dbError) {
        console.error('Failed to sync user to database:', dbError);
        // 不阻止注册流程，只记录错误
      }

      return res.status(201).json({
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          ...(result.user.user_metadata && { metadata: result.user.user_metadata })
        },
        session: {
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
          expires_in: result.session.expires_in || 3600
        },
        message: 'Registration successful'
      });
    }

    // 如果用户已存在但需要邮箱验证
    if (result.user && !result.session) {
      // 同步创建 Prisma User 记录（即使需要验证）
      try {
        await prisma.user.upsert({
          where: { id: result.user.id },
          update: {
            email: result.user.email || email,
            emailVerified: false,
            name: result.user.user_metadata?.name || metadata?.name || null,
            image: result.user.user_metadata?.avatar_url || null,
          },
          create: {
            id: result.user.id,
            email: result.user.email || email,
            emailVerified: false,
            name: result.user.user_metadata?.name || metadata?.name || null,
            image: result.user.user_metadata?.avatar_url || null,
          },
        });
      } catch (dbError) {
        console.error('Failed to sync user to database:', dbError);
        // 不阻止注册流程，只记录错误
      }

      return res.status(200).json({
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email
        },
        message: 'Registration successful. Please check your email to verify your account.'
      });
    }

    // 未知错误
    return res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  } catch (error) {
    console.error('Register API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

