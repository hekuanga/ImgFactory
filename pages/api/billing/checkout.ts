import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, attachUser } from '../../../lib/auth-middleware';
import { stripe, getOrCreateStripeCustomer } from '../../../lib/stripe';

// Checkout 请求体类型定义
interface CheckoutRequest extends AuthenticatedRequest {
  body: {
    priceId?: string; // 可选，如果不传递则使用默认的基础价格 ID
    successUrl?: string;
    cancelUrl?: string;
  };
}

// Checkout 响应类型
type CheckoutResponse = {
  success: boolean;
  sessionId?: string;
  url?: string;
  error?: string;
};

export default async function handler(
  req: CheckoutRequest,
  res: NextApiResponse<CheckoutResponse>
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
        error: 'Unauthorized - User must be logged in. Please provide a valid authentication token.'
      });
    }

    const { priceId, successUrl, cancelUrl } = req.body;

    // 如果没有传递 priceId，使用默认的基础价格 ID（从服务端环境变量获取）
    const finalPriceId = priceId || process.env.STRIPE_PRICE_BASIC;

    // 调试：输出环境变量（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('STRIPE_PRICE_BASIC:', process.env.STRIPE_PRICE_BASIC);
      console.log('finalPriceId:', finalPriceId);
    }

    // 验证价格 ID
    if (!finalPriceId) {
      console.error('STRIPE_PRICE_BASIC environment variable is not set');
      return res.status(500).json({
        success: false,
        error: 'Price configuration not found. Please contact support.'
      });
    }

    // 获取站点 URL（用于构建默认的重定向 URL）
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    // 获取或创建 Stripe Customer
    const customer = await getOrCreateStripeCustomer(userId, req.user?.email);

    // 创建 Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      // 使用 Supabase 用户 ID 作为 client_reference_id，方便在 webhook 中识别用户
      client_reference_id: userId,
      // 成功后的重定向 URL
      success_url: successUrl || `${siteUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      // 取消后的重定向 URL
      cancel_url: cancelUrl || `${siteUrl}/billing/cancel`,
      // 在 session metadata 中保存 Supabase 用户 ID
      metadata: {
        supabase_user_id: userId,
      },
      // 允许客户更新订阅信息
      allow_promotion_codes: true,
      // 订阅模式配置
      subscription_data: {
        metadata: {
          supabase_user_id: userId,
        },
      },
    });

    // 返回 Checkout Session URL
    return res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url || undefined
    });
  } catch (error) {
    console.error('Checkout error:', error);
    
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

