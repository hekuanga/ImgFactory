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
      const user = result.user; // 保存引用，避免TypeScript类型检查问题
      const userId = user.id;
      const userEmail = user.email;
      
      if (!userId) {
        return res.status(500).json({
          success: false,
          error: 'User ID is missing'
        });
      }
      
      // 同步创建 Prisma User 记录，并赠送新用户2积分
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
              email: userEmail || email,
              emailVerified: user.email_confirmed_at ? true : false,
              name: user.user_metadata?.name || metadata?.name || null,
              image: user.user_metadata?.avatar_url || null,
            },
            create: {
              id: userId,
              email: userEmail || email,
              emailVerified: user.email_confirmed_at ? true : false,
              name: user.user_metadata?.name || metadata?.name || null,
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
            console.log(`New user registered: ${userId}, bonus 2 credits added`);
          } else {
            // 如果用户已存在但没有积分历史记录，检查是否需要添加
            const existingHistory = await tx.creditHistory.findFirst({
              where: {
                userId: userId,
                type: 'bonus',
                description: '新用户注册奖励'
              }
            });
            
            // 如果用户已存在但没有注册奖励记录，且积分为0，可能是之前注册失败，现在补发
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
                  description: '新用户注册奖励（补发）'
                }
              });
              console.log(`Existing user without bonus credits: ${userId}, bonus 2 credits added`);
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
        // 不阻止注册流程，只记录错误（Supabase注册已成功）
      }

      return res.status(201).json({
        success: true,
        user: {
          id: userId,
          email: userEmail,
          ...(user.user_metadata && { metadata: user.user_metadata })
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
      const user = result.user; // 保存引用，避免TypeScript类型检查问题
      const userId = user.id;
      const userEmail = user.email;
      
      if (!userId) {
        return res.status(500).json({
          success: false,
          error: 'User ID is missing'
        });
      }
      
      // 同步创建 Prisma User 记录（即使需要验证），并赠送新用户2积分
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
              email: userEmail || email,
              emailVerified: false,
              name: user.user_metadata?.name || metadata?.name || null,
              image: user.user_metadata?.avatar_url || null,
            },
            create: {
              id: userId,
              email: userEmail || email,
              emailVerified: false,
              name: user.user_metadata?.name || metadata?.name || null,
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
            console.log(`New user registered (email verification required): ${userId}, bonus 2 credits added`);
          } else {
            // 如果用户已存在但没有积分历史记录，检查是否需要添加
            const existingHistory = await tx.creditHistory.findFirst({
              where: {
                userId: userId,
                type: 'bonus',
                description: '新用户注册奖励'
              }
            });
            
            // 如果用户已存在但没有注册奖励记录，且积分为0，可能是之前注册失败，现在补发
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
                  description: '新用户注册奖励（补发）'
                }
              });
              console.log(`Existing user without bonus credits (email verification required): ${userId}, bonus 2 credits added`);
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
        // 不阻止注册流程，只记录错误（Supabase注册已成功）
      }
      
      return res.status(200).json({
        success: true,
        user: {
          id: userId,
          email: userEmail
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

