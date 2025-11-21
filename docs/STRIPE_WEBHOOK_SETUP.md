# Stripe Webhook 订阅状态同步设置指南

## 概述

本文档说明如何设置 Stripe Webhook 以同步订阅状态到数据库。

## 功能说明

Webhook 会自动处理以下事件并更新用户订阅状态：

- **customer.subscription.created** - 订阅创建时，设置 `isSubscribed = true`
- **customer.subscription.updated** - 订阅更新时（升级/降级/续费），同步最新状态
- **customer.subscription.deleted** - 订阅取消时，设置 `isSubscribed = false`

## 数据库字段

Webhook 会更新以下 Prisma User 表字段：

- `isSubscribed` (Boolean) - 用户是否已订阅
- `stripeCustomerId` (String?) - Stripe Customer ID
- `stripeSubscriptionId` (String?) - Stripe Subscription ID
- `subscriptionStatus` (String?) - 订阅状态（active, canceled, past_due 等）
- `subscriptionTier` (String?) - 订阅等级（free, pro, vip）
- `currentPeriodEnd` (DateTime?) - 当前订阅周期结束时间

## 设置步骤

### 1. 数据库迁移

首先需要运行 Prisma 迁移以添加新字段：

```bash
# 生成 Prisma Client
npx prisma generate

# 创建迁移
npx prisma migrate dev --name add_stripe_subscription_fields

# 或直接推送到数据库（开发环境）
npx prisma db push
```

### 2. 配置 Stripe Webhook

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com)
2. 进入 **Developers** > **Webhooks**
3. 点击 **Add endpoint**
4. 设置端点 URL：
   - **开发环境**：`http://localhost:3000/api/billing/webhook`
   - **生产环境**：`https://yourdomain.com/api/billing/webhook`
5. 选择要监听的事件：
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed` (可选)
   - `invoice.payment_succeeded` (可选)
   - `invoice.payment_failed` (可选)
6. 创建后，复制 **Signing secret** → 设置为 `STRIPE_WEBHOOK_SECRET` 环境变量

### 3. 环境变量配置

在 `.env.local` 中添加：

```env
# Stripe Webhook
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe Price IDs (用于识别订阅等级)
STRIPE_PRICE_BASIC=price_xxxxxxxxxxxxx
STRIPE_PRICE_PRO=price_xxxxxxxxxxxxx
STRIPE_PRICE_VIP=price_xxxxxxxxxxxxx
```

### 4. 本地测试 Webhook

使用 Stripe CLI 测试本地 webhook：

```bash
# 安装 Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Windows: scoop install stripe

# 登录 Stripe CLI
stripe login

# 转发 webhook 到本地服务器
stripe listen --forward-to localhost:3000/api/billing/webhook

# 触发测试事件
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

## 工作原理

### 1. 签名验证

Webhook 使用 Stripe 的签名验证确保请求来自 Stripe：

```typescript
// 读取原始请求体（Buffer）
const rawBody = await getRawBody(req);

// 验证签名
const event = verifyWebhookSignature(rawBody, signature, webhookSecret);
```

**重要**：必须使用原始请求体（Buffer），不能使用解析后的 JSON。

### 2. 用户识别

Webhook 通过以下方式识别用户：

1. 从 Stripe Customer 的 `metadata.supabase_user_id` 获取用户 ID
2. 或从数据库中的 `stripeCustomerId` 映射关系查找

### 3. 状态更新

根据订阅状态更新 `isSubscribed`：

- **active** → `isSubscribed = true`
- **trialing** → `isSubscribed = true`
- **past_due** → `isSubscribed = true` (允许宽限期)
- **canceled** → `isSubscribed = false`
- **unpaid** → `isSubscribed = false`

### 4. 订阅等级识别

订阅等级通过以下方式确定：

1. 从订阅的 `metadata.tier` 字段（如果存在）
2. 或通过比较 `price.id` 与环境变量中的价格 ID

## 事件处理流程

### customer.subscription.created

```
1. 接收事件
2. 从 subscription.customer 获取 Stripe Customer ID
3. 查找对应的 Supabase 用户 ID
4. 更新数据库：
   - isSubscribed = true
   - stripeCustomerId = customer.id
   - stripeSubscriptionId = subscription.id
   - subscriptionStatus = subscription.status
   - subscriptionTier = 从 price 或 metadata 确定
   - currentPeriodEnd = subscription.current_period_end (转换为 DateTime)
```

### customer.subscription.updated

```
1. 接收事件
2. 从 subscription.customer 获取 Stripe Customer ID
3. 查找对应的 Supabase 用户 ID
4. 根据 subscription.status 判断是否激活：
   - active/trialing/past_due → isSubscribed = true
   - 其他 → isSubscribed = false
5. 更新所有订阅相关字段，包括 currentPeriodEnd
```

### customer.subscription.deleted

```
1. 接收事件
2. 从 subscription.customer 获取 Stripe Customer ID
3. 查找对应的 Supabase 用户 ID
4. 更新数据库：
   - isSubscribed = false
   - subscriptionStatus = 'canceled'
   - 保留其他字段（用于历史记录）
```

## 错误处理

Webhook 实现了完善的错误处理：

- **签名验证失败** → 返回 400 错误
- **用户未找到** → 记录日志，返回 200（非关键错误）
- **数据库更新失败** → 记录错误日志，返回 500

## 安全最佳实践

1. ✅ **签名验证**：所有请求都经过签名验证
2. ✅ **原始 Body**：使用原始 Buffer 进行签名验证
3. ✅ **错误处理**：完善的错误处理和日志记录
4. ✅ **幂等性**：多次处理同一事件不会产生副作用

## 故障排查

### Webhook 未触发

1. 检查 Stripe Dashboard 中的 Webhook 端点状态
2. 检查端点 URL 是否正确
3. 检查服务器日志中的错误信息

### 签名验证失败

1. 确认 `STRIPE_WEBHOOK_SECRET` 正确
2. 确认使用原始请求体（`bodyParser: false`）
3. 检查 `stripe-signature` 请求头是否存在

### 用户未找到

1. 确认 Stripe Customer 的 `metadata.supabase_user_id` 已设置
2. 确认数据库中存在对应的用户记录
3. 检查 `getSupabaseUserIdFromCustomer` 函数的实现

### 数据库更新失败

1. 检查 Prisma 连接配置
2. 检查数据库迁移是否已运行
3. 检查用户 ID 格式是否正确（UUID）

## 监控和日志

Webhook 会记录以下日志：

- 订阅创建/更新/删除事件
- 用户状态更新结果
- 错误和警告信息

建议在生产环境中：

1. 设置日志监控和告警
2. 定期检查 Stripe Dashboard 中的 Webhook 事件日志
3. 监控数据库中的订阅状态一致性

## 相关文件

- `pages/api/billing/webhook.ts` - Webhook 处理逻辑
- `lib/stripe.ts` - Stripe 工具函数
- `prisma/schema.prisma` - 数据库 Schema
- `lib/prismadb.ts` - Prisma Client 初始化

