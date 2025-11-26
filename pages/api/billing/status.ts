import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, attachUser } from '../../../lib/auth-middleware';
import prisma from '../../../lib/prismadb';

type SubscriptionStatusResponse = {
  success: boolean;
  subscription?: {
    isSubscribed: boolean;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    subscriptionStatus?: string | null;
    subscriptionTier?: string | null;
    currentPeriodEnd?: string | null;
  };
  error?: string;
};

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<SubscriptionStatusResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // 使用 attachUser 中间件获取用户信息
    await attachUser(req, res);

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - User must be logged in'
      });
    }

    try {
      // 从数据库获取用户订阅信息，如果不存在则自动创建
      let user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          isSubscribed: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          subscriptionStatus: true,
          subscriptionTier: true,
          currentPeriodEnd: true,
        },
      });

      // 如果用户不存在，尝试从 Supabase Auth 获取用户信息并创建记录
      if (!user) {
        try {
          // 使用 attachUser 获取的 email 信息
          const email = req.user?.email;
          
          // 使用 upsert 创建或更新用户记录（避免重复创建错误）
          await prisma.user.upsert({
            where: { id: userId },
            update: {
              email: email || undefined,
            },
            create: {
              id: userId,
              email: email || `${userId}@unknown`,
              emailVerified: false,
            },
          });

          // 重新查询用户
          user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
              isSubscribed: true,
              stripeCustomerId: true,
              stripeSubscriptionId: true,
              subscriptionStatus: true,
              subscriptionTier: true,
              currentPeriodEnd: true,
            },
          });
        } catch (createError) {
          console.error('Failed to create user record:', createError);
          // 如果创建失败，返回默认值而不是错误
          return res.status(200).json({
            success: true,
            subscription: {
              isSubscribed: false,
              stripeCustomerId: null,
              stripeSubscriptionId: null,
              subscriptionStatus: null,
              subscriptionTier: 'free',
              currentPeriodEnd: null,
            },
          });
        }
      }

      if (!user) {
        // 如果用户不存在，返回默认值
        return res.status(200).json({
          success: true,
          subscription: {
            isSubscribed: false,
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            subscriptionStatus: null,
            subscriptionTier: 'free',
            currentPeriodEnd: null,
          },
        });
      }

      return res.status(200).json({
        success: true,
        subscription: {
          isSubscribed: user.isSubscribed,
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionId: user.stripeSubscriptionId,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionTier: user.subscriptionTier || 'free',
          currentPeriodEnd: user.currentPeriodEnd?.toISOString() || null,
        },
      });
    } catch (dbError) {
      // 数据库连接错误 - 优雅降级，返回默认订阅状态
      console.error('Database error in billing/status:', dbError);
      
      if (dbError instanceof Error && 
          (dbError.message.includes('Can\'t reach database server') || 
           dbError.message.includes('connect') ||
           dbError.message.includes('P1001'))) {
        console.warn('Database connection failed - returning default subscription status');
        // 返回默认的免费订阅状态，而不是错误
        return res.status(200).json({
          success: true,
          subscription: {
            isSubscribed: false,
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            subscriptionStatus: null,
            subscriptionTier: 'free',
            currentPeriodEnd: null,
          },
        });
      }
      // 其他数据库错误，抛出以便外层 catch 处理
      throw dbError;
    }
  } catch (error) {
    console.error('Get subscription status error:', error);
    
    // 检查是否是数据库连接错误
    if (error instanceof Error && 
        (error.message.includes('Can\'t reach database server') || 
         error.message.includes('connect') ||
         error.message.includes('P1001'))) {
      console.warn('Database connection failed - returning default subscription status');
      // 返回默认的免费订阅状态，而不是错误
      return res.status(200).json({
        success: true,
        subscription: {
          isSubscribed: false,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          subscriptionStatus: null,
          subscriptionTier: 'free',
          currentPeriodEnd: null,
        },
      });
    }
    
    // 其他错误返回错误响应
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}

