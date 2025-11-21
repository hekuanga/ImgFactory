# Stripe 快速接入指南

本文档提供 Stripe 的快速接入步骤，适合快速参考。

---

## 🚀 5 分钟快速接入

### 步骤 1：创建账户（1 分钟）

1. 访问 [https://stripe.com](https://stripe.com)
2. 注册账号
3. 完成账户验证

### 步骤 2：获取 API 密钥（1 分钟）

1. 进入 **Developers** > **API keys**
2. 复制以下密钥：
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

### 步骤 3：创建产品（1 分钟）

1. 进入 **Products**
2. 点击 **"Add product"**
3. 填写产品名称和描述
4. 点击 **"Save product"**
5. **记录产品 ID**（`prod_xxx`）

### 步骤 4：创建价格（1 分钟）

1. 在产品页面找到 **Pricing** 部分
2. 点击 **"Add price"**
3. 配置价格：
   - Pricing model: **Recurring**
   - Price: 输入价格（如：`9.99`）
   - Billing period: 选择周期（如：Monthly）
4. 点击 **"Save price"**
5. **复制价格 ID**（`price_xxx`）**← 这是您需要的！**

### 步骤 5：配置 Webhook（1 分钟）

1. 进入 **Developers** > **Webhooks**
2. 点击 **"Add endpoint"**
3. 填写：
   - Endpoint URL: `http://localhost:3000/api/billing/webhook`
   - 选择事件：`checkout.session.completed`, `customer.subscription.*`
4. 点击 **"Add endpoint"**
5. 复制 **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 步骤 6：配置环境变量

在 `.env.local` 文件中添加：

```env
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_BASIC=price_xxxxx
```

---

## 📋 关键配置项清单

### 必需配置
- [ ] `STRIPE_SECRET_KEY` - 密钥（服务端）
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - 公开密钥（客户端）
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook 签名密钥
- [ ] `STRIPE_PRICE_BASIC` - 基础套餐价格 ID
- [ ] `STRIPE_PRICE_VIP` - VIP 套餐价格 ID（如需要）

### 重要提示
- ✅ 使用 **Price ID**（`price_xxx`），不是 Product ID（`prod_xxx`）
- ✅ 开发环境使用 **Test mode** 密钥
- ✅ Webhook Secret 只会显示一次，请立即保存

---

## 🧪 测试支付

### 测试卡号
- **成功支付**: `4242 4242 4242 4242`
- **需要 3D Secure**: `4000 0025 0000 3155`
- **支付失败**: `4000 0000 0000 0002`

过期日期：任意未来日期（如 `12/34`）  
CVC：任意 3 位数字（如 `123`）

---

## 🔍 常见问题快速解决

### 问题：找不到价格 ID

**解决：** 
1. 确认使用的是 Price ID（`price_xxx`），不是 Product ID
2. 在产品页面的 **Pricing** 部分查找

### 问题：Webhook 签名验证失败

**解决：** 
1. 确认 `STRIPE_WEBHOOK_SECRET` 正确
2. 确保 API 路由配置了 `bodyParser: false`

---

## 📖 详细文档

完整详细教程请参考：[INTEGRATION_TUTORIAL.md](./INTEGRATION_TUTORIAL.md)

