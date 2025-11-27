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
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    try {
      // 获取用户积分余额
      const userRecord = await (prisma.user.findUnique as any)({
        where: { id: user.id },
        select: { credits: true }
      });

      if (!userRecord) {
        // 如果用户不存在，创建用户记录（默认0积分）
        try {
          await (prisma.user.create as any)({
            data: {
              id: user.id,
              email: user.email || '',
              credits: 0
            }
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
          throw createError;
        }
        return res.status(200).json({
          success: true,
          credits: 0
        });
      }

      return res.status(200).json({
        success: true,
        credits: userRecord.credits || 0
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

