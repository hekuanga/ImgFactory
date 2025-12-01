import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '../../../lib/auth-middleware';
import prisma from '../../../lib/prismadb';

type CreditsResponse = {
  success: boolean;
  credits?: number;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreditsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const user = await verifyAuth(req, res);
    if (!user) {
      console.log('[CreditsBalance] No user found in request');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    console.log(`[CreditsBalance] User authenticated: id=${user.id}, email=${user.email}`);

    try {
      // 添加日志用于调试
      console.log(`[CreditsBalance] Querying credits for userId: ${user.id}, email: ${user.email}`);
      
      // 获取用户积分余额
      // 确保 user.id 是字符串格式（Supabase 返回的 ID 是字符串）
      const userId = String(user.id);
      console.log(`[CreditsBalance] Querying with userId (string): ${userId}, type: ${typeof userId}`);
      
      const userRecord = await (prisma.user.findUnique as any)({
        where: { id: userId },
        select: { credits: true }
      });

      console.log(`[CreditsBalance] User record found:`, userRecord ? `credits=${userRecord.credits}, type=${typeof userRecord.credits}` : 'not found');
      
      // 如果没找到，尝试通过邮箱查找（备用方案）
      if (!userRecord && user.email) {
        console.log(`[CreditsBalance] User not found by ID, trying to find by email: ${user.email}`);
        const userByEmail = await (prisma.user.findUnique as any)({
          where: { email: user.email },
          select: { id: true, credits: true }
        });
        if (userByEmail) {
          console.log(`[CreditsBalance] Found user by email: id=${userByEmail.id}, credits=${userByEmail.credits}`);
          console.warn(`[CreditsBalance] WARNING: User ID mismatch! Supabase ID: ${userId}, DB ID: ${userByEmail.id}`);
          // 如果找到用户但ID不匹配，返回该用户的积分
          return res.status(200).json({
            success: true,
            credits: userByEmail.credits ?? 0
          });
        }
      }

      if (!userRecord) {
        // 如果用户不存在，使用 upsert 创建用户记录（避免唯一约束冲突）
        try {
          const createdUser = await (prisma.user.upsert as any)({
            where: { id: user.id },
            update: {
              email: user.email || '',
            },
            create: {
              id: user.id,
              email: user.email || '',
              credits: 0
            }
          });
          return res.status(200).json({
            success: true,
            credits: createdUser.credits || 0
          });
        } catch (createError: any) {
          // 如果创建失败（可能是数据库连接问题），返回默认值
          if (createError?.message?.includes('Can\'t reach database') || 
              createError?.message?.includes('connect') ||
              createError?.code === 'P1001') {
            console.warn('Database connection error when creating user, returning default credits:', createError.message);
            return res.status(200).json({
              success: true,
              credits: 0
            });
          }
          // 如果是唯一约束冲突（P2002），说明用户已存在，重新查询
          if (createError?.code === 'P2002') {
            console.warn('User already exists (unique constraint), re-querying:', createError.message);
            const existingUser = await (prisma.user.findUnique as any)({
              where: { id: user.id },
              select: { credits: true }
            });
            return res.status(200).json({
              success: true,
              credits: existingUser?.credits || 0
            });
          }
          throw createError;
        }
      }

      const credits = userRecord.credits ?? 0;
      console.log(`[CreditsBalance] Returning credits: ${credits} for userId: ${user.id}`);
      
      return res.status(200).json({
        success: true,
        credits: credits
      });
    } catch (dbError: any) {
      // 处理数据库连接错误和列不存在错误，优雅降级
      if (dbError?.message?.includes('Can\'t reach database') || 
          dbError?.message?.includes('connect') ||
          dbError?.code === 'P1001' ||
          dbError?.code === 'P2022' || // Column does not exist
          dbError?.message?.includes('does not exist')) {
        console.warn('Database error (connection or schema), returning default credits:', dbError.message);
        // 数据库不可用或列不存在时，返回默认值0，而不是错误
        return res.status(200).json({
          success: true,
          credits: 0
        });
      }
      // 其他数据库错误继续抛出
      throw dbError;
    }
  } catch (error) {
    console.error('Get credits balance error:', error);
    // 最后的错误处理，如果是数据库连接错误或列不存在，返回默认值
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const errorCode = (error as any)?.code;
    if (errorMessage.includes('Can\'t reach database') || 
        errorMessage.includes('connect') ||
        errorMessage.includes('does not exist') ||
        errorCode === 'P1001' ||
        errorCode === 'P2022') {
      return res.status(200).json({
        success: true,
        credits: 0
      });
    }
    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}

