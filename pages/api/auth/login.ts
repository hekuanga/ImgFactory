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
      const user = result.user; // 保存引用，避免TypeScript类型检查问题
      const userId = user.id;
      
      if (!userId) {
        return res.status(500).json({
          success: false,
          error: 'User ID is missing'
        });
      }
      
      // 同步创建或更新 Prisma User 记录，并检查是否需要补发注册奖励
      try {
        // 先检查用户是否已存在
        const existingUser = await (prisma.user.findUnique as any)({
          where: { id: userId },
          select: { id: true, credits: true }
        });

        const isNewUser = !existingUser;

        // 使用事务确保数据一致性
        await prisma.$transaction(async (tx: any) => {
          // 创建或更新用户
          const upsertedUser = await tx.user.upsert({
            where: { id: userId },
            update: {
              email: user.email || email,
              emailVerified: user.email_confirmed_at ? true : false,
              name: user.user_metadata?.name || null,
              image: user.user_metadata?.avatar_url || null,
            },
            create: {
              id: userId,
              email: user.email || email,
              emailVerified: user.email_confirmed_at ? true : false,
              name: user.user_metadata?.name || null,
              image: user.user_metadata?.avatar_url || null,
              credits: 2, // 新用户赠送2积分
            },
          });

          // 如果是新用户，记录积分历史
          if (isNewUser) {
            await tx.creditHistory.create({
              data: {
                userId: userId,
                amount: 2,
                type: 'bonus',
                description: '新用户注册奖励'
              }
            });
            console.log(`New user logged in: ${userId}, bonus 2 credits added`);
          } else {
            // 如果用户已存在，检查是否有注册奖励记录
            const existingHistory = await tx.creditHistory.findFirst({
              where: {
                userId: userId,
                type: 'bonus',
                description: {
                  contains: '新用户注册奖励'
                }
              }
            });
            
            // 如果用户已存在但没有注册奖励记录，且积分为0或null，补发2积分
            if (!existingHistory && (upsertedUser.credits === 0 || upsertedUser.credits === null)) {
              await tx.user.update({
                where: { id: userId },
                data: { credits: 2 }
              });
              await tx.creditHistory.create({
                data: {
                  userId: userId,
                  amount: 2,
                  type: 'bonus',
                  description: '新用户注册奖励（登录补发）'
                }
              });
              console.log(`Existing user without bonus credits logged in: ${userId}, bonus 2 credits added`);
            }
          }
        });
      } catch (dbError: any) {
        console.error('Failed to sync user to database:', dbError);
        // 记录详细错误信息
        if (dbError?.code) {
          console.error('Database error code:', dbError.code);
        }
        if (dbError?.message) {
          console.error('Database error message:', dbError.message);
        }
        // 不阻止登录流程，只记录错误
      }

      return res.status(200).json({
        success: true,
        user: {
          id: userId,
          email: user.email,
          ...(user.user_metadata && { metadata: user.user_metadata })
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


