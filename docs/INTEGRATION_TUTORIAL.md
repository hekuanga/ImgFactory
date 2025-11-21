# Supabase + Stripe 完整接入教程

本文档提供 Supabase Auth 和 Stripe Billing 的完整接入流程，可作为详细参考指南。

---

## 📋 目录

1. [Supabase 接入流程](#supabase-接入流程)
2. [Stripe 接入流程](#stripe-接入流程)
3. [项目集成步骤](#项目集成步骤)
4. [环境变量配置](#环境变量配置)
5. [代码集成](#代码集成)
6. [测试流程](#测试流程)
7. [常见问题](#常见问题)

---

## 🔐 Supabase 接入流程

### 步骤 1：注册和创建项目

1. **访问 Supabase**
   - 打开 [https://supabase.com](https://supabase.com)
   - 点击 "Start your project" 或 "Sign Up"

2. **注册账号**
   - 使用 GitHub、GitLab 或邮箱注册
   - 验证邮箱（如需要）

3. **创建新项目**
   - 点击 "New Project"
   - 填写项目信息：
     - **Name**: 项目名称（如：`restorephotos`）
     - **Database Password**: 设置数据库密码（**重要：请妥善保存**）
     - **Region**: 选择区域（如：`Southeast Asia (Singapore)` 或 `South Asia (Mumbai)`）
     - **Pricing Plan**: 选择免费计划（Free）或付费计划

4. **等待项目创建**
   - 通常需要 1-2 分钟
   - 创建完成后会显示项目 Dashboard

### 步骤 2：获取 API 密钥

1. **进入项目设置**
   - 在项目 Dashboard 左侧导航栏
   - 点击 **Settings**（齿轮图标）
   - 选择 **API**

2. **复制 API 密钥**
   - **Project URL**: 复制项目 URL（格式：`https://xxxxx.supabase.co`）
   - **anon public key**: 复制匿名密钥（以 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` 开头）
   - **service_role key**: 复制服务角色密钥（**注意：仅在服务端使用，不要暴露给客户端**）

3. **保存密钥**
   - 将这些密钥保存到安全的地方
   - 稍后需要添加到项目的 `.env.local` 文件

### 步骤 3：配置数据库连接

#### 3.1 获取数据库连接字符串

1. **进入数据库设置**
   - 在项目 Dashboard 中
   - 点击 **Settings** > **Database**

2. **获取连接字符串**
   - 找到 **Connection string** 部分
   - 选择 **URI** 标签
   - 选择 **Session mode**（连接池模式，支持 IPv4）
   - 复制连接字符串

   **连接字符串格式：**
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
   ```

   **示例：**
   ```
   postgresql://postgres.fbafdgtmmzoqrgrtdkkl:your_password@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
   ```

3. **获取数据库密码**
   - 如果连接字符串中显示 `[YOUR_PASSWORD]`，需要获取实际密码
   - 在 **Database password** 部分：
     - 如果显示密码，直接复制
     - 如果显示 `••••••••`，点击 **Reset database password** 重置
     - **重要：** 重置后的密码只会显示一次，请立即复制保存

#### 3.2 验证数据库连接

1. **测试连接**
   ```bash
   npx prisma db pull
   ```
   - 如果成功，说明连接正常
   - 如果失败，检查密码和连接字符串格式

2. **同步数据库 Schema**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

### 步骤 4：配置 Authentication

1. **进入 Authentication 设置**
   - 在项目 Dashboard 中
   - 点击 **Authentication** > **Settings**

2. **配置 Email Auth**
   - **Enable email confirmations**: 
     - 开发环境：建议**禁用**（注册后立即登录）
     - 生产环境：建议**启用**（需要邮箱验证）

3. **配置 Site URL 和 Redirect URLs**
   - **Site URL**: 设置你的网站 URL（如：`http://localhost:3000`）
   - **Redirect URLs**: 添加允许的重定向 URL：
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/verify-email`
     - 生产环境：添加生产域名

4. **配置 Email Templates（可选）**
   - 可以自定义验证邮件模板
   - 可以自定义密码重置邮件模板

### 步骤 5：配置数据库连接（连接池模式）

**重要：** Supabase 的直接连接默认使用 IPv6，如果您的环境不支持 IPv6，必须使用连接池模式。

1. **获取连接池连接字符串**
   - 在项目 Dashboard 中
   - 点击页面顶部的 **"Connect"** 按钮
   - 选择 **"Session mode"** 标签
   - 复制连接字符串

2. **连接字符串格式**
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
   ```
   
   **关键点：**
   - 用户名格式：`postgres.[project-ref]`（不是 `postgres`）
   - 主机格式：`aws-0-[region].pooler.supabase.com`（不是 `db.[project-ref].supabase.co`）
   - 端口：`5432`（Session mode）或 `6543`（Transaction mode）

3. **常见区域代码**
   - `us-east-1` - 美国东部
   - `us-west-1` - 美国西部
   - `eu-west-1` - 欧洲西部
   - `ap-southeast-1` - 亚太东南（新加坡）
   - `ap-south-1` - 亚太南部（孟买）
   - `ap-east-1` - 亚太东部（香港）

---

## 💳 Stripe 接入流程

### 步骤 1：注册和设置账户

1. **访问 Stripe**
   - 打开 [https://stripe.com](https://stripe.com)
   - 点击 "Sign up" 注册账号

2. **完成账户设置**
   - 填写基本信息（邮箱、密码等）
   - 验证邮箱
   - 完成账户验证（可能需要提供身份信息）

3. **选择账户类型**
   - **个人账户**：适合个人开发者
   - **企业账户**：适合公司使用

### 步骤 2：获取 API 密钥

1. **进入 API 密钥页面**
   - 登录 Stripe Dashboard
   - 点击左侧导航栏的 **Developers** > **API keys**

2. **复制 API 密钥**
   - **Publishable key**（公开密钥）：
     - 格式：`pk_test_xxxxxxxxxxxxx`（测试环境）或 `pk_live_xxxxxxxxxxxxx`（生产环境）
     - 可以暴露给客户端
     - 复制到 `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   
   - **Secret key**（密钥）：
     - 格式：`sk_test_xxxxxxxxxxxxx`（测试环境）或 `sk_live_xxxxxxxxxxxxx`（生产环境）
     - **绝对不能暴露给客户端**
     - 仅在服务端使用
     - 复制到 `STRIPE_SECRET_KEY`

3. **切换测试/生产模式**
   - 在 Dashboard 右上角有切换按钮
   - 开发阶段使用 **Test mode**
   - 生产环境使用 **Live mode**

### 步骤 3：创建产品（Product）

1. **进入产品页面**
   - 在 Stripe Dashboard 中
   - 点击左侧导航栏的 **Products**

2. **创建新产品**
   - 点击 **"Add product"** 按钮
   - 填写产品信息：
     - **Name**: 产品名称（如：`Basic Subscription`）
     - **Description**: 产品描述（可选）
     - **Images**: 产品图片（可选）

3. **保存产品**
   - 点击 **"Save product"**
   - 记录产品 ID（格式：`prod_xxxxxxxxxxxxx`）

### 步骤 4：创建价格（Price）

**重要：** 需要的是**价格 ID**（`price_xxx`），不是产品 ID（`prod_xxx`）

1. **在产品页面创建价格**
   - 在产品详情页面
   - 找到 **Pricing** 部分
   - 点击 **"Add another price"** 或 **"Add price"**

2. **配置价格信息**
   - **Pricing model**: 选择 **Recurring**（订阅模式）
   - **Price**: 输入价格（如：`9.99`）
   - **Billing period**: 选择计费周期：
     - **Daily** - 每天
     - **Weekly** - 每周
     - **Monthly** - 每月
     - **Yearly** - 每年
   - **Currency**: 选择货币（如：`USD`、`CNY`）

3. **保存价格**
   - 点击 **"Save price"**
   - **复制价格 ID**（格式：`price_xxxxxxxxxxxxx`）
   - **重要：** 这是您需要在代码中使用的 ID

4. **创建多个价格（可选）**
   - 可以为同一个产品创建多个价格（如：月付、年付）
   - 每个价格都有独立的 Price ID

### 步骤 5：配置 Webhook

1. **进入 Webhooks 页面**
   - 在 Stripe Dashboard 中
   - 点击左侧导航栏的 **Developers** > **Webhooks**

2. **添加 Webhook 端点**
   - 点击 **"Add endpoint"** 按钮
   - 填写端点信息：
     - **Endpoint URL**: 
       - 开发环境：`http://localhost:3000/api/billing/webhook`
       - 生产环境：`https://yourdomain.com/api/billing/webhook`
     - **Description**: 端点描述（可选）

3. **选择监听事件**
   - 勾选以下事件：
     - `checkout.session.completed` - Checkout 完成
     - `customer.subscription.created` - 订阅创建
     - `customer.subscription.updated` - 订阅更新
     - `customer.subscription.deleted` - 订阅删除
     - `invoice.payment_succeeded` - 支付成功
     - `invoice.payment_failed` - 支付失败

4. **保存并获取 Webhook Secret**
   - 点击 **"Add endpoint"**
   - 创建后，点击端点查看详情
   - 找到 **Signing secret** 部分
   - 点击 **"Reveal"** 显示密钥
   - **复制 Webhook Secret**（格式：`whsec_xxxxxxxxxxxxx`）
   - **重要：** 这个密钥只会显示一次，请立即保存

### 步骤 6：本地测试 Webhook（可选）

1. **安装 Stripe CLI**
   - **Windows**: 
     - 使用 Scoop: `scoop install stripe`
     - 或从 [Stripe CLI 下载页面](https://stripe.com/docs/stripe-cli) 下载
   - **macOS**: `brew install stripe/stripe-cli/stripe`
   - **Linux**: 参考 [Stripe CLI 文档](https://stripe.com/docs/stripe-cli)

2. **登录 Stripe CLI**
   ```bash
   stripe login
   ```
   - 会打开浏览器进行授权

3. **转发 Webhook 到本地**
   ```bash
   stripe listen --forward-to localhost:3000/api/billing/webhook
   ```
   - 会显示一个 Webhook Secret（格式：`whsec_xxxxxxxxxxxxx`）
   - 使用这个 Secret 作为 `STRIPE_WEBHOOK_SECRET`（仅用于本地测试）

4. **触发测试事件**
   ```bash
   stripe trigger checkout.session.completed
   ```

---

## 🔧 项目集成步骤

### 步骤 1：安装依赖

```bash
npm install @supabase/supabase-js stripe
```

### 步骤 2：创建 Supabase 客户端

创建 `lib/supabaseClient.ts`：

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 客户端 Supabase 实例（用于前端）
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// 服务端 Supabase 实例（用于 API 路由）
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 从访问令牌创建客户端（用于 API 路由中的用户验证）
export function createServerClient(accessToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
```

### 步骤 3：创建 Stripe 客户端

创建 `lib/stripe.ts`：

```typescript
import Stripe from 'stripe';

// 延迟初始化 Stripe 客户端
let stripeInstance: Stripe | null = null;

function initializeStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    });
  }
  return stripeInstance;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const instance = initializeStripe();
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

export function getStripePublishableKey(): string {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  }
  return publishableKey;
}
```

### 步骤 4：创建认证中间件

创建 `lib/auth-middleware.ts`：

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email?: string;
    [key: string]: any;
  };
}

function extractToken(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
}

export async function verifyAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<User | null> {
  try {
    const token = extractToken(req);
    if (!token) {
      return null;
    }

    const clientWithToken = createServerClient(token);
    const { data: { user }, error } = await clientWithToken.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('verifyAuth error:', error);
    return null;
  }
}

export async function attachUser(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next?: () => void
): Promise<void> {
  const user = await verifyAuth(req, res);
  if (user) {
    req.user = {
      id: user.id,
      email: user.email,
      ...user.user_metadata
    };
  } else {
    req.user = undefined;
  }
  if (next) {
    next();
  }
}
```

### 步骤 5：创建 Auth API 路由

#### 5.1 注册 API (`pages/api/auth/register.ts`)

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseClient } from '../../../lib/supabaseClient';
import prisma from '../../../lib/prismadb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // 使用 Supabase 注册
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // 同步创建 Prisma User 记录
    if (data.user) {
      await prisma.user.upsert({
        where: { id: data.user.id },
        update: {
          email: data.user.email || email,
          emailVerified: data.user.email_confirmed_at ? true : false,
        },
        create: {
          id: data.user.id,
          email: data.user.email || email,
          emailVerified: false,
        },
      });
    }

    return res.status(201).json({
      success: true,
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

#### 5.2 登录 API (`pages/api/auth/login.ts`)

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseClient } from '../../../lib/supabaseClient';
import prisma from '../../../lib/prismadb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // 使用 Supabase 登录
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // 同步创建或更新 Prisma User 记录
    if (data.user) {
      await prisma.user.upsert({
        where: { id: data.user.id },
        update: {
          email: data.user.email || email,
          emailVerified: data.user.email_confirmed_at ? true : false,
        },
        create: {
          id: data.user.id,
          email: data.user.email || email,
          emailVerified: false,
        },
      });
    }

    return res.status(200).json({
      success: true,
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### 步骤 6：创建 Stripe Checkout API

创建 `pages/api/billing/checkout.ts`：

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, attachUser } from '../../../lib/auth-middleware';
import { stripe } from '../../../lib/stripe';

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await attachUser(req, res);

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { priceId } = req.body;
    const finalPriceId = priceId || process.env.STRIPE_PRICE_BASIC;

    if (!finalPriceId) {
      return res.status(500).json({ error: 'Price configuration not found' });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // 创建 Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      success_url: `${siteUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/billing/cancel`,
      metadata: {
        supabase_user_id: userId,
      },
    });

    return res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### 步骤 7：创建 Stripe Webhook API

创建 `pages/api/billing/webhook.ts`：

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../../lib/stripe';
import Stripe from 'stripe';
import prisma from '../../../lib/prismadb';

export const config = {
  api: {
    bodyParser: false,
  },
};

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return res.status(400).json({ error: 'Missing signature or secret' });
    }

    const rawBody = await getRawBody(req);

    // 验证 Webhook 签名
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );

    // 处理不同的事件类型
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (userId) {
          // 确定订阅等级
          let tier = 'free';
          if (subscription.items.data.length > 0) {
            const priceId = subscription.items.data[0].price.id;
            if (priceId === process.env.STRIPE_PRICE_VIP) {
              tier = 'vip';
            } else if (priceId === process.env.STRIPE_PRICE_BASIC) {
              tier = 'basic';
            }
          }

          // 更新数据库
          await prisma.user.updateMany({
            where: { id: userId },
            data: {
              isSubscribed: true,
              stripeCustomerId: subscription.customer as string,
              stripeSubscriptionId: subscription.id,
              subscriptionStatus: subscription.status,
              subscriptionTier: tier,
              currentPeriodEnd: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000)
                : null,
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (userId) {
          await prisma.user.updateMany({
            where: { id: userId },
            data: {
              isSubscribed: false,
              subscriptionStatus: 'canceled',
            },
          });
        }
        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).json({ error: 'Webhook error' });
  }
}
```

---

## 📝 环境变量配置

### 步骤 1：创建 `.env.local` 文件

在项目根目录创建 `.env.local` 文件（注意前面的点）。

### 步骤 2：添加 Supabase 配置

```env
# ============================================
# Supabase Configuration
# ============================================
# 从 Supabase Dashboard > Settings > API 获取
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================
# Supabase Database Configuration
# ============================================
# 从 Supabase Dashboard > Settings > Database > Connection string > Session mode 获取
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

### 步骤 3：添加 Stripe 配置

```env
# ============================================
# Stripe Configuration
# ============================================
# 从 Stripe Dashboard > Developers > API keys 获取
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# ============================================
# Stripe Webhook Secret
# ============================================
# 从 Stripe Dashboard > Developers > Webhooks > [Your Endpoint] > Signing secret 获取
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# ============================================
# Stripe Price IDs
# ============================================
# 从 Stripe Dashboard > Products > [Your Product] > Pricing 获取
# 注意：这是 Price ID (price_xxx)，不是 Product ID (prod_xxx)
STRIPE_PRICE_BASIC=price_your_basic_price_id_here
STRIPE_PRICE_VIP=price_your_vip_price_id_here
```

### 步骤 4：添加应用配置

```env
# ============================================
# Application Configuration
# ============================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 步骤 5：同步到 `.env` 文件

**重要：** 为了确保 Prisma CLI 也能读取配置，建议同时更新 `.env` 文件。

---

## 💻 代码集成

### 前端集成

#### 1. 创建 Auth Context (`contexts/AuthContext.tsx`)

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取初始 session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

#### 2. 在 `_app.tsx` 中包装应用

```typescript
import { AuthProvider } from '../contexts/AuthContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
```

#### 3. 创建登录页面 (`pages/login.tsx`)

```typescript
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabaseClient } from '../lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/');
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="邮箱"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密码"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? '登录中...' : '登录'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
```

#### 4. 创建订阅页面 (`pages/billing/index.tsx`)

参考已更新的 `pages/billing/index.tsx` 文件，包含套餐选择界面。

---

## 🧪 测试流程

### 测试 Supabase Auth

1. **测试注册**
   - 访问 `/register` 页面
   - 填写邮箱和密码
   - 提交注册
   - 检查 Supabase Dashboard > Authentication > Users 中是否出现新用户

2. **测试登录**
   - 访问 `/login` 页面
   - 使用注册的邮箱和密码登录
   - 检查是否能成功登录并跳转

3. **测试 Session**
   - 登录后检查浏览器控制台
   - 应该能看到 Supabase session 已保存

### 测试 Stripe Checkout

1. **测试创建 Checkout Session**
   - 登录后访问 `/billing` 页面
   - 选择套餐并点击订阅
   - 应该跳转到 Stripe Checkout 页面

2. **测试支付（使用测试卡号）**
   - 在 Stripe Checkout 页面使用测试卡号：
     - 卡号：`4242 4242 4242 4242`
     - 过期日期：任意未来日期（如 `12/34`）
     - CVC：任意 3 位数字（如 `123`）
   - 完成支付
   - 应该重定向到 `/billing/success`

3. **验证 Webhook**
   - 检查服务器日志
   - 应该看到 Webhook 事件被处理
   - 检查数据库中的用户订阅状态是否已更新

### 测试数据库同步

1. **验证用户记录**
   - 注册后检查数据库
   - Prisma User 表中应该有对应的用户记录

2. **验证订阅记录**
   - 完成支付后检查数据库
   - 用户的 `isSubscribed`、`subscriptionTier` 等字段应该已更新

---

## ❓ 常见问题

### Supabase 相关问题

#### Q1: 注册后无法登录，显示 "Invalid login credentials"

**原因：** Supabase 启用了邮箱验证，注册后需要先验证邮箱。

**解决方案：**
1. **开发环境**：在 Supabase Dashboard > Authentication > Settings 中禁用 "Enable email confirmations"
2. **生产环境**：检查邮箱收件箱，点击验证链接

#### Q2: 数据库连接失败，显示 "Can't reach database server"

**原因：** 
- 使用了直接连接模式（需要 IPv6）
- 连接字符串格式错误
- 密码错误

**解决方案：**
1. 使用连接池模式（Session mode）
2. 检查连接字符串格式：
   - 用户名：`postgres.[project-ref]`
   - 主机：`aws-0-[region].pooler.supabase.com`
3. 验证数据库密码是否正确

#### Q3: Prisma 读取了错误的 DATABASE_URL

**原因：** Prisma CLI 可能优先读取 `.env` 文件。

**解决方案：**
1. 同时更新 `.env` 和 `.env.local` 文件
2. 确保两个文件中的 `DATABASE_URL` 都使用连接池模式

### Stripe 相关问题

#### Q1: 找不到价格 ID

**原因：** 
- 使用了产品 ID 而不是价格 ID
- 环境变量未正确配置

**解决方案：**
1. 确认使用的是 Price ID（`price_xxx`），不是 Product ID（`prod_xxx`）
2. 检查环境变量是否正确配置
3. 重启开发服务器

#### Q2: Webhook 签名验证失败

**原因：** 
- Webhook Secret 不正确
- 请求体被修改

**解决方案：**
1. 确认 `STRIPE_WEBHOOK_SECRET` 正确
2. 确保 API 路由配置了 `bodyParser: false`
3. 使用原始请求体进行签名验证

#### Q3: 测试支付后订阅状态未更新

**原因：** 
- Webhook 未正确配置
- Webhook 事件未正确处理

**解决方案：**
1. 检查 Stripe Dashboard > Webhooks 中的事件日志
2. 检查服务器日志中的 Webhook 处理错误
3. 确认 Webhook 端点 URL 正确

---

## 📚 参考资源

### Supabase 文档
- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Supabase 数据库连接文档](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase JavaScript 客户端文档](https://supabase.com/docs/reference/javascript)

### Stripe 文档
- [Stripe Checkout 文档](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks 文档](https://stripe.com/docs/webhooks)
- [Stripe API 参考](https://stripe.com/docs/api)

### Next.js 文档
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Next.js 环境变量](https://nextjs.org/docs/basic-features/environment-variables)

---

## ✅ 检查清单

完成接入后，请确认：

### Supabase
- [ ] 项目已创建
- [ ] API 密钥已获取并配置
- [ ] 数据库连接字符串已配置（连接池模式）
- [ ] Authentication 已配置
- [ ] Site URL 和 Redirect URLs 已设置
- [ ] 数据库 Schema 已同步（Prisma）

### Stripe
- [ ] 账户已创建
- [ ] API 密钥已获取并配置
- [ ] 产品已创建
- [ ] 价格已创建（Price ID 已获取）
- [ ] Webhook 端点已配置
- [ ] Webhook Secret 已获取并配置

### 项目配置
- [ ] `.env.local` 文件已创建并配置
- [ ] `.env` 文件已同步配置
- [ ] 所有环境变量已正确设置
- [ ] 开发服务器已重启

### 功能测试
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 订阅页面显示正常
- [ ] Checkout 流程正常
- [ ] Webhook 处理正常
- [ ] 订阅状态同步正常

---

## 🎉 完成

完成以上所有步骤后，您的项目应该已经成功集成了 Supabase Auth 和 Stripe Billing！

如有任何问题，请参考本文档的"常见问题"部分或相关文档。

