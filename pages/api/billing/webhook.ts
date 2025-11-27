import type { NextApiRequest, NextApiResponse } from 'next';
import { stripe, verifyWebhookSignature, getSupabaseUserIdFromCustomer } from '../../../lib/stripe';
import Stripe from 'stripe';
import prisma from '../../../lib/prismadb';

// 重要：禁用 bodyParser 以接收原始请求体（用于签名验证）
export const config = {
  api: {
    bodyParser: false,
  },
};

// Webhook 响应类型
type WebhookResponse = {
  success: boolean;
  error?: string;
};

/**
 * 从请求中读取原始 body（Buffer）
 */
async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    req.on('error', reject);
  });
}

/**
 * 更新用户订阅状态
 */
async function updateUserSubscription(
  supabaseUserId: string,
  subscription: Stripe.Subscription,
  isActive: boolean
): Promise<void> {
  try {
    // 确定订阅等级（从 price ID 或 metadata 中提取）
    let subscriptionTier: string = 'free';
    if (subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id;
      // 根据环境变量中的价格 ID 判断等级
      if (priceId === process.env.STRIPE_PRICE_VIP) {
        subscriptionTier = 'vip';
      } else if (priceId === process.env.STRIPE_PRICE_PRO) {
        subscriptionTier = 'pro';
      } else if (priceId === process.env.STRIPE_PRICE_BASIC) {
        subscriptionTier = 'basic'; // Basic 套餐
      }
    }

    // 从 subscription metadata 中获取等级（如果存在）
    if (subscription.metadata?.tier) {
      subscriptionTier = subscription.metadata.tier;
    }

    // 更新数据库
    await prisma.user.updateMany({
      where: {
        id: supabaseUserId,
      },
      data: {
        isSubscribed: isActive,
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionTier: subscriptionTier,
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000) // Stripe 使用 Unix 时间戳（秒），转换为 Date
          : null,
        updatedAt: new Date(),
      },
    });

    console.log(`Updated subscription for user ${supabaseUserId}:`, {
      isSubscribed: isActive,
      status: subscription.status,
      tier: subscriptionTier,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
    });
  } catch (error) {
    console.error(`Failed to update subscription for user ${supabaseUserId}:`, error);
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WebhookResponse>
) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing stripe-signature header'
      });
    }

    if (!webhookSecret) {
      return res.status(500).json({
        success: false,
        error: 'Missing STRIPE_WEBHOOK_SECRET environment variable'
      });
    }

    // 读取原始请求体（Buffer）
    const rawBody = await getRawBody(req);

    // 验证 webhook 签名
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(rawBody, signature, webhookSecret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    // 处理不同类型的事件
    switch (event.type) {
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const supabaseUserId = await getSupabaseUserIdFromCustomer(
          subscription.customer as string
        );

        if (!supabaseUserId) {
          console.error(
            `Could not find Supabase user ID for Stripe customer: ${subscription.customer}`
          );
          return res.status(200).json({
            success: true,
            error: 'User not found (non-critical)'
          });
        }

        // 订阅已创建，更新用户状态
        await updateUserSubscription(supabaseUserId, subscription, true);
        console.log(`Subscription created for user: ${supabaseUserId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const supabaseUserId = await getSupabaseUserIdFromCustomer(
          subscription.customer as string
        );

        if (!supabaseUserId) {
          console.error(
            `Could not find Supabase user ID for Stripe customer: ${subscription.customer}`
          );
          return res.status(200).json({
            success: true,
            error: 'User not found (non-critical)'
          });
        }

        // 订阅已更新（升级/降级/续费等）
        // 检查订阅状态是否为 active、trialing 或 past_due
        const isActive =
          subscription.status === 'active' ||
          subscription.status === 'trialing' ||
          subscription.status === 'past_due';

        await updateUserSubscription(supabaseUserId, subscription, isActive);
        console.log(`Subscription updated for user: ${supabaseUserId}, status: ${subscription.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const supabaseUserId = await getSupabaseUserIdFromCustomer(
          subscription.customer as string
        );

        if (!supabaseUserId) {
          console.error(
            `Could not find Supabase user ID for Stripe customer: ${subscription.customer}`
          );
          return res.status(200).json({
            success: true,
            error: 'User not found (non-critical)'
          });
        }

        // 订阅已取消/删除，更新用户状态
        await updateUserSubscription(supabaseUserId, subscription, false);
        console.log(`Subscription deleted for user: ${supabaseUserId}`);
        break;
      }

      // 处理积分购买（一次性支付）
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // 如果是积分购买（一次性支付）
        if (session.mode === 'payment' && session.client_reference_id) {
          const [supabaseUserId, creditsAmount] = session.client_reference_id.split(':');
          const credits = parseInt(creditsAmount, 10);
          
          if (supabaseUserId && credits > 0) {
            try {
              // 增加用户积分
              await prisma.$transaction(async (tx: any) => {
                // 确保用户存在
                await tx.user.upsert({
                  where: { id: supabaseUserId },
                  update: {},
                  create: {
                    id: supabaseUserId,
                    email: session.customer_email || '',
                    credits: 0
                  }
                });

                // 增加积分
                await tx.user.update({
                  where: { id: supabaseUserId },
                  data: {
                    credits: {
                      increment: credits
                    }
                  }
                });

                // 记录积分历史
                await tx.creditHistory.create({
                  data: {
                    userId: supabaseUserId,
                    amount: credits,
                    type: 'purchase',
                    description: `Stripe支付购买 ${credits} 积分`
                  }
                });
              });
              
              console.log(`Credits purchased: ${credits} credits added to user ${supabaseUserId}`);
            } catch (error) {
              console.error(`Failed to add credits for user ${supabaseUserId}:`, error);
              // 不抛出错误，避免webhook重试
            }
          }
        }
        
        // 如果 checkout session 包含订阅，可以通过 client_reference_id 获取用户
        if (session.mode === 'subscription' && session.client_reference_id) {
          const supabaseUserId = session.client_reference_id;
          // 注意：此时订阅可能还未创建，建议等待 subscription.created 事件
          console.log(`Checkout completed for user: ${supabaseUserId}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          // 支付成功，订阅状态应该已经是 active
          console.log(`Payment succeeded for subscription: ${invoice.subscription}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          // 支付失败，可能需要更新订阅状态
          console.log(`Payment failed for subscription: ${invoice.subscription}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // 返回成功响应
    return res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

