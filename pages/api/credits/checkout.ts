import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '../../../lib/auth-middleware';
import { stripe, getOrCreateStripeCustomer } from '../../../lib/stripe';

type CreditsCheckoutRequest = {
  creditsAmount: number; // 积分数量
  price: number; // 实际价格（元）
  packageId?: string; // 套餐ID（可选）
};

type CreditsCheckoutResponse = {
  success: boolean;
  sessionId?: string;
  url?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreditsCheckoutResponse>
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

    const { creditsAmount, price, packageId } = req.body as CreditsCheckoutRequest;

    if (!creditsAmount || creditsAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credits amount'
      });
    }

    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid price'
      });
    }

    // 使用前端传递的价格，而不是计算价格
    const totalPrice = price;

    // 获取站点 URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    // 获取或创建 Stripe Customer
    const customer = await getOrCreateStripeCustomer(user.id, user.email);

    // 创建 Stripe Checkout Session（一次性支付）
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', // 一次性支付，不是订阅
      customer: customer.id,
      line_items: [
        {
          price_data: {
            currency: 'cny', // 人民币
            product_data: {
              name: `${creditsAmount} 积分`,
              description: `购买 ${creditsAmount} 积分用于照片生成`,
            },
            unit_amount: Math.round(totalPrice * 100), // Stripe使用分为单位，使用前端传递的价格
          },
          quantity: 1,
        },
      ],
      // 使用 Supabase 用户 ID 和积分数量作为 client_reference_id
      client_reference_id: `${user.id}:${creditsAmount}`,
      // 成功后的重定向 URL
      success_url: `${siteUrl}/credits/success?session_id={CHECKOUT_SESSION_ID}&amount=${creditsAmount}`,
      // 取消后的重定向 URL
      cancel_url: `${siteUrl}/credits?canceled=true`,
      // 在 session metadata 中保存用户ID和积分数量
      metadata: {
        supabase_user_id: user.id,
        credits_amount: creditsAmount.toString(),
        price: totalPrice.toString(), // 保存实际支付价格
        package_id: packageId || '',
      },
      // 允许使用优惠码
      allow_promotion_codes: true,
    });

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url || undefined
    });
  } catch (error) {
    console.error('Credits checkout error:', error);
    
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

