import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, attachUser } from '../../../lib/auth-middleware';
import { stripe, getOrCreateStripeCustomer } from '../../../lib/stripe';

// Portal 请求体类型定义
interface PortalRequest extends AuthenticatedRequest {
  body: {
    returnUrl?: string;
  };
}

// Portal 响应类型
type PortalResponse = {
  success: boolean;
  url?: string;
  error?: string;
};

export default async function handler(
  req: PortalRequest,
  res: NextApiResponse<PortalResponse>
) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
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

    const { returnUrl } = req.body;

    // 获取站点 URL（用于构建默认的重定向 URL）
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    // 获取或创建 Stripe Customer
    const customer = await getOrCreateStripeCustomer(userId, req.user?.email);

    // 创建 Stripe Customer Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: returnUrl || `${siteUrl}/billing`,
    });

    // 返回 Portal URL
    return res.status(200).json({
      success: true,
      url: session.url || undefined
    });
  } catch (error) {
    console.error('Portal error:', error);
    
    // 处理 Stripe 错误
    if (error && typeof error === 'object' && 'type' in error) {
      const stripeError = error as any;
      return res.status(400).json({
        success: false,
        error: stripeError.message || 'Stripe API error'
      });
    }

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

