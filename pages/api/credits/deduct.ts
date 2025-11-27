import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '../../../lib/auth-middleware';
import prisma from '../../../lib/prismadb';

type DeductCreditsRequest = {
  amount: number;
  description?: string;
};

type DeductCreditsResponse = {
  success: boolean;
  credits?: number;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeductCreditsResponse>
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

    const { amount, description } = req.body as DeductCreditsRequest;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    // 使用事务确保数据一致性
    const result = await prisma.$transaction(async (tx: any) => {
      // 获取当前积分
      const userRecord = await tx.user.findUnique({
        where: { id: user.id },
        select: { credits: true }
      });

      if (!userRecord) {
        throw new Error('User not found');
      }

      const currentCredits = userRecord.credits || 0;

      // 检查积分是否足够
      if (currentCredits < amount) {
        throw new Error('Insufficient credits');
      }

      // 扣除积分
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          credits: {
            decrement: amount
          }
        },
        select: { credits: true }
      });

      // 记录积分历史
      await tx.creditHistory.create({
        data: {
          userId: user.id,
          amount: -amount,
          type: 'deduct',
          description: description || `扣除 ${amount} 积分`
        }
      });

      return updatedUser.credits;
    });

    return res.status(200).json({
      success: true,
      credits: result
    });
  } catch (error) {
    console.error('Deduct credits error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    if (errorMessage === 'Insufficient credits') {
      return res.status(400).json({
        success: false,
        error: '积分不足'
      });
    }

    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}

