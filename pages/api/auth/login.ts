import type { NextApiRequest, NextApiResponse } from 'next';
import { signIn } from '../../../services/auth';
import type { SignInResponse } from '../../../services/auth';
import prisma from '../../../lib/prismadb';

// 登录请求体类型定义
interface LoginRequest extends NextApiRequest {
  body: {
    email: string;
    password: string;
  };
}

// 登录响应类型
type LoginResponse = {
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
  req: LoginRequest,
  res: NextApiResponse<LoginResponse>
) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { email, password } = req.body;

    // 验证请求参数
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // 调用 auth service 登录函数
    const result: SignInResponse = await signIn({
      email,
      password
    });

    // 处理登录结果
    if (result.error) {
      // 根据错误类型返回相应的状态码
      let statusCode = 500;
      if (result.error.name === 'ValidationError') {
        statusCode = 400;
      } else if (result.error.message?.includes('Invalid login credentials')) {
        statusCode = 401;
      } else if (result.error.message?.includes('Email not confirmed')) {
        statusCode = 403;
      }

      return res.status(statusCode).json({
        success: false,
        error: result.error.message || 'Login failed'
      });
    }

    // 登录成功
    if (result.user && result.session) {
      // 同步创建或更新 Prisma User 记录
      try {
        await prisma.user.upsert({
          where: { id: result.user.id },
          update: {
            email: result.user.email || email,
            emailVerified: result.user.email_confirmed_at ? true : false,
            name: result.user.user_metadata?.name || null,
            image: result.user.user_metadata?.avatar_url || null,
          },
          create: {
            id: result.user.id,
            email: result.user.email || email,
            emailVerified: result.user.email_confirmed_at ? true : false,
            name: result.user.user_metadata?.name || null,
            image: result.user.user_metadata?.avatar_url || null,
          },
        });
      } catch (dbError) {
        console.error('Failed to sync user to database:', dbError);
        // 不阻止登录流程，只记录错误
      }

      return res.status(200).json({
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
        message: 'Login successful'
      });
    }

    // 未知错误
    return res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  } catch (error) {
    console.error('Login API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}


