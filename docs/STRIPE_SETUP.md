# Stripe 配置指南

## 获取 Stripe 环境变量

### 1. Stripe API Keys

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com)
2. 进入 **Developers** > **API keys**
3. 复制以下密钥：
   - **Secret key** → `STRIPE_SECRET_KEY` (以 `sk_test_` 或 `sk_live_` 开头)
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (以 `pk_test_` 或 `pk_live_` 开头)

### 2. Stripe Webhook Secret

1. 在 Stripe Dashboard 中进入 **Developers** > **Webhooks**
2. 点击 **Add endpoint** 或选择现有端点
3. 设置端点 URL：
   - 开发环境：`http://localhost:3000/api/billing/webhook`
   - 生产环境：`https://yourdomain.com/api/billing/webhook`
4. 选择要监听的事件：
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. 创建后，点击端点查看 **Signing secret** → `STRIPE_WEBHOOK_SECRET` (以 `whsec_` 开头)

### 3. Stripe 价格 ID (Price IDs)

**重要：** 需要的是**价格 ID** (`price_xxx`)，不是产品 ID (`prod_xxx`)

1. 在 Stripe Dashboard 中进入 **Products**
2. 找到你的产品：`prod_TRHomIxfL7LUeg`
3. 点击产品，查看 **Pricing** 部分
4. 复制每个订阅计划的价格 ID：
   - **Basic 计划** → `STRIPE_PRICE_BASIC` (以 `price_` 开头)
   - **Pro 计划** → `STRIPE_PRICE_PRO` (以 `price_` 开头)
   - **VIP 计划** (如果有) → `STRIPE_PRICE_VIP` (以 `price_` 开头)

**注意：**
- 一个产品可以有多个价格（例如：月付、年付）
- 选择你需要的价格 ID
- 价格 ID 格式：`price_xxxxxxxxxxxxx`

### 4. 如何区分产品 ID 和价格 ID

- **产品 ID** (`prod_xxx`): 产品的标识符，一个产品可以有多个价格
- **价格 ID** (`price_xxx`): 具体的价格计划标识符，用于创建订阅

示例：
```
产品: prod_TRHomIxfL7LUeg
  ├─ 价格 1: price_xxxxxxxxxxxxx (月付 $9.99)
  └─ 价格 2: price_yyyyyyyyyyyyy (年付 $99.99)
```

## 环境变量配置步骤

1. **复制模板文件**：
   ```bash
   cp .env.example .env.local
   ```

2. **填写 Stripe 配置**：
   - 打开 `.env.local`
   - 填入从 Stripe Dashboard 获取的值

3. **验证配置**：
   - 确保所有 `STRIPE_*` 变量都已填写
   - 确保价格 ID 格式正确（以 `price_` 开头）

## 测试环境 vs 生产环境

### 测试环境 (Test Mode)
- 使用 `sk_test_` 和 `pk_test_` 开头的密钥
- 使用测试卡号进行支付测试
- Webhook 可以使用本地工具测试（如 Stripe CLI）

### 生产环境 (Live Mode)
- 使用 `sk_live_` 和 `pk_live_` 开头的密钥
- 需要切换到 Live mode
- Webhook 需要配置生产环境的 URL

## 测试卡号

在测试模式下，可以使用以下测试卡号：

- **成功支付**: `4242 4242 4242 4242`
- **需要 3D Secure**: `4000 0025 0000 3155`
- **支付失败**: `4000 0000 0000 0002`

过期日期：任意未来日期（如 `12/34`）
CVC：任意 3 位数字（如 `123`）

## 常见问题

### Q: 找不到价格 ID？
**A:** 
1. 确保你查看的是产品的 **Pricing** 部分
2. 如果没有价格，需要先创建价格计划
3. 价格 ID 在价格列表的右侧，格式为 `price_xxx`

### Q: 如何创建新的价格？
**A:**
1. 进入产品页面
2. 点击 **Add another price**
3. 设置价格、计费周期等
4. 保存后即可看到新的价格 ID

### Q: Webhook 在本地如何测试？
**A:**
1. 安装 Stripe CLI: `stripe listen --forward-to localhost:3000/api/billing/webhook`
2. Stripe CLI 会提供一个测试用的 webhook secret
3. 使用这个 secret 作为 `STRIPE_WEBHOOK_SECRET`

## 下一步

配置完成后：
1. 重启开发服务器
2. 测试支付流程
3. 验证 Webhook 是否正常工作


