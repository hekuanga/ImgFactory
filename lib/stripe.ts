import Stripe from 'stripe';

// Stripe 客户端初始化
// 注意：请确保在 .env.local 中设置以下环境变量：
// STRIPE_SECRET_KEY=your_stripe_secret_key
// STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key (可选，用于客户端)
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key (用于客户端)

/**
 * 获取 Stripe Secret Key（延迟读取，确保环境变量已加载）
 */
function getStripeSecretKey(): string {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeSecretKey) {
    throw new Error(
      'Missing env.STRIPE_SECRET_KEY. Please ensure STRIPE_SECRET_KEY is set in .env.local file.'
    );
  }
  
  return stripeSecretKey;
}

/**
 * Stripe 服务端客户端实例（延迟初始化）
 * 用于服务端操作（创建支付会话、处理 webhook 等）
 */
let stripeInstance: Stripe | null = null;

function initializeStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = getStripeSecretKey();
    // 不指定 apiVersion，使用 Stripe SDK 的默认版本，避免类型定义不匹配的问题
    stripeInstance = new Stripe(secretKey, {
      typescript: true,
    });
  }
  return stripeInstance;
}

/**
 * 获取 Stripe 客户端实例（延迟初始化）
 * 只有在实际使用时才会初始化，避免模块加载时的错误
 */
export function getStripe(): Stripe {
  return initializeStripe();
}

// 为了向后兼容，导出 stripe 实例
// 延迟初始化：只有在实际访问时才会创建实例
export const stripe = (() => {
  // 使用函数立即执行，但返回一个对象，该对象的方法会在调用时才初始化
  const stripeProxy = {} as Stripe;
  
  // 延迟初始化：在第一次访问任何属性时初始化
  return new Proxy(stripeProxy, {
    get(_target, prop) {
      const instance = initializeStripe();
      const value = (instance as any)[prop];
      
      // 如果是函数，绑定正确的 this 上下文
      if (typeof value === 'function') {
        return value.bind(instance);
      }
      
      return value;
    }
  });
})();

/**
 * 获取 Stripe Publishable Key（用于客户端）
 * @returns Stripe Publishable Key
 */
export function getStripePublishableKey(): string {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error('Missing env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  }
  return publishableKey;
}

/**
 * 验证 Stripe Webhook 签名
 * 重要：必须使用原始请求体（Buffer），不能使用解析后的 JSON
 * @param payload - Webhook 请求体（必须是原始 Buffer 或字符串）
 * @param signature - Stripe 签名头（stripe-signature header）
 * @param secret - Webhook 签名密钥（STRIPE_WEBHOOK_SECRET）
 * @returns Stripe Event 对象
 * @throws 如果签名无效，抛出错误
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    // 使用 Stripe SDK 验证签名
    // 注意：payload 必须是原始请求体，不能是解析后的 JSON
    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    return event;
  } catch (error) {
    // 签名验证失败
    console.error('Webhook signature verification failed:', error);
    throw new Error(
      `Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * 根据 Supabase 用户 ID 查找或创建 Stripe Customer
 * @param supabaseUserId - Supabase 用户 ID
 * @param email - 用户邮箱（可选）
 * @returns Stripe Customer 对象
 */
export async function getOrCreateStripeCustomer(
  supabaseUserId: string,
  email?: string
): Promise<Stripe.Customer> {
  try {
    // 方法1: 先从数据库查找是否已有 Stripe Customer ID
    let prisma: any;
    try {
      prisma = (await import('./prismadb')).default;
      const user = await prisma.user.findUnique({
        where: { id: supabaseUserId },
        select: { stripeCustomerId: true },
      });

      if (user?.stripeCustomerId) {
        // 从数据库中找到 Customer ID，直接获取
        try {
          const existingCustomer = await stripe.customers.retrieve(user.stripeCustomerId);
          if (!existingCustomer.deleted) {
            return existingCustomer as Stripe.Customer;
          }
        } catch (error) {
          // Customer 不存在或已删除，继续创建新的
          console.log(`Stripe customer ${user.stripeCustomerId} not found, creating new one`);
        }
      }
    } catch (error) {
      // Prisma 不可用或查询失败，继续使用 metadata 查找
      console.log('Database lookup failed, falling back to metadata search:', error);
    }

    // 方法2: 通过 metadata 查找现有 Customer（备用方案）
    const customers = await stripe.customers.list({
      limit: 100,
      // 注意：Stripe API 不支持直接通过 metadata 搜索，所以我们需要遍历
    });

    // 查找匹配的 Customer
    let existingCustomer = customers.data.find(
      (customer) => customer.metadata?.supabase_user_id === supabaseUserId
    );

    // 如果找到，更新数据库并返回
    if (existingCustomer) {
      // 更新数据库中的 stripeCustomerId（如果 Prisma 可用）
      try {
        if (prisma) {
          await prisma.user.updateMany({
            where: { id: supabaseUserId },
            data: { stripeCustomerId: existingCustomer.id },
          });
        }
      } catch (error) {
        // 忽略数据库更新错误，不影响返回 Customer
        console.log('Failed to update database with customer ID:', error);
      }
      return existingCustomer;
    }

    // 方法3: 如果没找到，创建新的 Customer
    const newCustomer = await stripe.customers.create({
      email: email,
      metadata: {
        supabase_user_id: supabaseUserId,
      },
    });

    // 将 Stripe Customer ID 保存到数据库（如果 Prisma 可用）
    try {
      if (prisma) {
        await prisma.user.updateMany({
          where: { id: supabaseUserId },
          data: { stripeCustomerId: newCustomer.id },
        });
      }
    } catch (error) {
      // 忽略数据库更新错误，不影响返回 Customer
      console.log('Failed to save customer ID to database:', error);
    }

    return newCustomer;
  } catch (error) {
    console.error('getOrCreateStripeCustomer error:', error);
    throw new Error(
      `Failed to get or create Stripe customer: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * 根据 Stripe Customer ID 查找 Supabase 用户 ID
 * @param stripeCustomerId - Stripe Customer ID
 * @returns Supabase 用户 ID
 */
export async function getSupabaseUserIdFromCustomer(
  stripeCustomerId: string
): Promise<string | null> {
  try {
    // 方法1: 先从数据库查找（最快）
    try {
      const prisma = (await import('./prismadb')).default;
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId },
        select: { id: true },
      });

      if (user?.id) {
        return user.id;
      }
    } catch (error) {
      // Prisma 不可用或查询失败，继续使用 Stripe API
      console.log('Database lookup failed, falling back to Stripe API:', error);
    }

    // 方法2: 从 Stripe Customer metadata 中提取（备用方案）
    const customer = await stripe.customers.retrieve(stripeCustomerId);

    if (customer.deleted) {
      return null;
    }

    // 从 metadata 中提取 Supabase 用户 ID
    if (customer.metadata?.supabase_user_id) {
      return customer.metadata.supabase_user_id;
    }

    return null;
  } catch (error) {
    console.error('getSupabaseUserIdFromCustomer error:', error);
    return null;
  }
}

