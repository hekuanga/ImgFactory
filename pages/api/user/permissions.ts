import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '../../../lib/auth-middleware';
import type { SubscriptionTier } from '../../../utils/permissions';

// 获取用户订阅等级响应类型
type GetUserTierResponse = {
  success: boolean;
  tier?: SubscriptionTier;
  error?: string;
};

// 强制订阅等级检查响应类型
type EnforceTierResponse = {
  success: boolean;
  allowed: boolean;
  message?: string;
  error?: string;
};

/**
 * 获取用户的订阅等级
 * @param req - Next.js API 请求对象
 * @param res - Next.js API 响应对象
 */
export async function getUserTier(
  req: AuthenticatedRequest,
  res: NextApiResponse<GetUserTierResponse>
): Promise<void> {
  try {
    // TODO: 实现获取用户订阅等级逻辑
    // 1. 从 req.user.id 获取 Supabase 用户 id
    // 2. 查询数据库或 Stripe 获取用户的订阅信息
    // 3. 根据订阅状态确定用户等级（free/pro/vip）
    // 4. 返回用户等级

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized - User must be logged in'
      });
      return;
    }

    // 临时返回，待实现
    res.status(200).json({
      success: true,
      tier: 'free'
    });
  } catch (error) {
    console.error('Get user tier error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

/**
 * 强制检查用户是否拥有指定订阅等级
 * 如果用户等级不足，返回 403 错误
 * @param req - Next.js API 请求对象
 * @param res - Next.js API 响应对象
 * @param tier - 需要的订阅等级（'pro' 或 'vip'）
 * @returns 如果用户等级满足要求返回 true，否则返回 false 并发送错误响应
 */
export async function enforceTier(
  req: AuthenticatedRequest,
  res: NextApiResponse<EnforceTierResponse>,
  tier: 'pro' | 'vip'
): Promise<boolean> {
  try {
    // TODO: 实现订阅等级强制检查逻辑
    // 1. 从 req.user.id 获取 Supabase 用户 id
    // 2. 调用 getUserTier 获取用户当前等级
    // 3. 使用 hasTierAccess 检查用户是否满足要求
    // 4. 如果等级不足，返回 403 错误和错误信息
    // 5. 如果等级满足，返回 true

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        allowed: false,
        error: 'Unauthorized - User must be logged in'
      });
      return false;
    }

    // 临时返回，待实现
    res.status(403).json({
      success: false,
      allowed: false,
      message: `This feature requires ${tier} subscription`
    });
    return false;
  } catch (error) {
    console.error('Enforce tier error:', error);
    res.status(500).json({
      success: false,
      allowed: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
    return false;
  }
}

// API 路由处理器（可选，如果需要通过 HTTP 调用）
export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<GetUserTierResponse | EnforceTierResponse>
) {
  // 只允许 GET 请求（获取用户等级）
  if (req.method === 'GET') {
    await getUserTier(req, res);
    return;
  }

  // POST 请求用于强制检查等级
  if (req.method === 'POST') {
    const { tier } = req.body as { tier?: 'pro' | 'vip' };
    if (!tier || (tier !== 'pro' && tier !== 'vip')) {
      res.status(400).json({
        success: false,
        allowed: false,
        error: 'Invalid tier. Must be "pro" or "vip"'
      });
      return;
    }
    await enforceTier(req, res, tier);
    return;
  }

  res.status(405).json({
    success: false,
    error: 'Method not allowed'
  } as GetUserTierResponse);
}

