import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '../../../lib/auth-middleware';
import { stripe, getOrCreateStripeCustomer } from '../../../lib/stripe';

// Subscription 请求体类型定义
interface SubscriptionRequest extends AuthenticatedRequest {
  body: {
    action?: 'create' | 'cancel' | 'update';
    subscriptionId?: string;
    priceId?: string;
  };
}

// Subscription 响应类型
type SubscriptionResponse = {
  success: boolean;
  subscription?: any;
  message?: string;
  error?: string;
};

export default async function handler(
  req: SubscriptionRequest,
  res: NextApiResponse<SubscriptionResponse>
) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // TODO: 实现认证检查
    // 1. 使用 requireAuth 或 attachUser 中间件获取用户信息
    // 2. 确保 req.user 存在（用户已登录）
    // 3. 如果未登录，返回 401 错误

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - User must be logged in'
      });
    }

    const { action, subscriptionId, priceId } = req.body;

    // TODO: 实现订阅管理逻辑
    // 根据 action 执行不同操作：
    // 
    // - create: 创建新订阅
    //   1. 调用 getOrCreateStripeCustomer() 获取或创建 Stripe Customer
    //   2. 使用 stripe.subscriptions.create() 创建订阅
    //   3. 设置 metadata: { supabase_user_id: userId }
    //   4. 保存订阅信息到数据库
    // 
    // - cancel: 取消订阅
    //   1. 验证 subscriptionId 是否属于当前用户
    //   2. 使用 stripe.subscriptions.cancel() 取消订阅
    //   3. 更新数据库中的订阅状态
    // 
    // - update: 更新订阅（升级/降级）
    //   1. 验证 subscriptionId 是否属于当前用户
    //   2. 使用 stripe.subscriptions.update() 更新订阅计划
    //   3. 更新数据库中的订阅信息
    // 
    // 注意：所有操作都需要关联 Supabase 用户 id（userId）

    // 占位注释：使用 Supabase 用户 id 关联订阅
    // const customer = await getOrCreateStripeCustomer(userId, req.user?.email);
    // 
    // if (action === 'create') {
    //   const subscription = await stripe.subscriptions.create({
    //     customer: customer.id,
    //     items: [{ price: priceId }],
    //     metadata: { supabase_user_id: userId }
    //   });
    // }
    // 
    // if (action === 'cancel') {
    //   await stripe.subscriptions.cancel(subscriptionId);
    // }
    // 
    // if (action === 'update') {
    //   await stripe.subscriptions.update(subscriptionId, {
    //     items: [{ id: subscription.items.data[0].id, price: priceId }]
    //   });
    // }

    // 临时返回，待实现
    return res.status(200).json({
      success: true,
      message: 'Subscription endpoint - implementation pending'
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

