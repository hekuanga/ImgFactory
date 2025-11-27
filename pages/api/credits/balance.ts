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

    // 获取用户积分余额
    const userRecord = await (prisma.user.findUnique as any)({
      where: { id: user.id },
      select: { credits: true }
    });

    if (!userRecord) {
      // 如果用户不存在，创建用户记录（默认0积分）
      await (prisma.user.create as any)({
        data: {
          id: user.id,
          email: user.email || '',
          credits: 0
        }
      });
      return res.status(200).json({
        success: true,
        credits: 0
      });
    }

    return res.status(200).json({
      success: true,
      credits: userRecord.credits || 0
    });
  } catch (error) {
    console.error('Get credits balance error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

