import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '../../../lib/auth-middleware';
import prisma from '../../../lib/prismadb';

type AddCreditsRequest = {
  amount: number;
  type?: string;
  description?: string;
};

type AddCreditsResponse = {
  success: boolean;
  credits?: number;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AddCreditsResponse>
) {
  if (req.method !== 'POST') {
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

    const { amount, type = 'purchase', description } = req.body as AddCreditsRequest;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    // 使用事务确保数据一致性
    const result = await prisma.$transaction(async (tx: any) => {
      // 确保用户存在
      const userRecord = await tx.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email: user.email || '',
          credits: 0
        },
        select: { credits: true }
      });

      // 增加积分
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          credits: {
            increment: amount
          }
        },
        select: { credits: true }
      });

      // 记录积分历史
      await tx.creditHistory.create({
        data: {
          userId: user.id,
          amount: amount,
          type: type,
          description: description || `增加 ${amount} 积分`
        }
      });

      return updatedUser.credits;
    });

    return res.status(200).json({
      success: true,
      credits: result
    });
  } catch (error) {
    console.error('Add credits error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

