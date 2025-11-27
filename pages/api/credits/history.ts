import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '../../../lib/auth-middleware';
import prisma from '../../../lib/prismadb';

type CreditHistoryResponse = {
  success: boolean;
  history?: Array<{
    id: string;
    amount: number;
    type: string;
    description: string | null;
    createdAt: Date;
  }>;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreditHistoryResponse>
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

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // 获取积分历史记录
    const history = await (prisma.creditHistory.findMany as any)({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        createdAt: true
      }
    });

    return res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Get credit history error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

