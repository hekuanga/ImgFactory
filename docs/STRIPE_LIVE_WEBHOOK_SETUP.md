# Stripe 正式账户 Webhook 配置指南

## 重要说明

从测试账户切换到正式账户后，需要：
1. ✅ 使用 Live API Keys (`sk_live_` 和 `pk_live_`)
2. ✅ 创建新的 Webhook Endpoint（生产环境）
3. ✅ 获取新的 Webhook Secret (`whsec_` 开头)
4. ✅ 更新环境变量

## 步骤 1: 切换到 Live Mode

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com)
2. 确保右上角显示 **"Live mode"**（不是 "Test mode"）
3. 如果没有，点击右上角的开关切换到 Live mode

## 步骤 2: 创建生产环境 Webhook Endpoint

1. 在 Stripe Dashboard 中进入 **Developers** > **Webhooks**
2. 点击右上角的 **"Add endpoint"** 按钮
3. 填写端点信息：
   - **Endpoint URL**: `https://imgfactorys.vercel.app/api/billing/webhook`
   - **Description** (可选): `Production webhook for credit purchases and subscriptions`
4. 选择要监听的事件（勾选以下事件）：
   - ✅ `checkout.session.completed` - 支付完成（积分购买）
   - ✅ `customer.subscription.created` - 订阅创建
   - ✅ `customer.subscription.updated` - 订阅更新
   - ✅ `customer.subscription.deleted` - 订阅取消
   - ✅ `invoice.payment_succeeded` - 发票支付成功
   - ✅ `invoice.payment_failed` - 发票支付失败
5. 点击 **"Add endpoint"** 创建

## 步骤 3: 获取 Webhook Secret

1. 创建端点后，点击端点名称进入详情页
2. 在 **"Signing secret"** 部分，点击 **"Reveal"** 按钮
3. **重要**：Webhook Secret 只会显示一次，请立即复制！
4. 格式：`whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
5. 复制完整的 Secret（以 `whsec_` 开头）

## 步骤 4: 更新环境变量

### 在 Vercel 中更新环境变量

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 选择你的项目：`restorephotos` 或 `ImgFactory`
3. 进入 **Settings** > **Environment Variables**
4. 找到 `STRIPE_WEBHOOK_SECRET` 环境变量
5. 点击编辑，将值更新为新的 Webhook Secret
6. 确保选择正确的环境：
   - **Production** - 生产环境
   - **Preview** - 预览环境（可选）
   - **Development** - 开发环境（可选）
7. 点击 **Save**

### 在本地开发环境中更新

如果你有 `.env.local` 文件，也需要更新：

```env
# 旧的测试环境 Webhook Secret（删除或注释掉）
# STRIPE_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxxx

# 新的正式环境 Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 步骤 5: 验证配置

### 检查清单

- [ ] Stripe Dashboard 显示 **Live mode**
- [ ] Webhook Endpoint URL 设置为：`https://imgfactorys.vercel.app/api/billing/webhook`
- [ ] 所有必需的事件都已选择
- [ ] Webhook Secret 已复制（格式：`whsec_` 开头）
- [ ] Vercel 环境变量已更新
- [ ] 本地 `.env.local` 已更新（如果使用）

### 测试 Webhook

1. **触发测试事件**：
   - 在网站上购买积分
   - 或创建一个测试订阅

2. **检查 Webhook 日志**：
   - 在 Stripe Dashboard > **Developers** > **Webhooks**
   - 点击你的端点
   - 查看 **"Recent events"** 标签
   - 应该能看到事件被成功发送

3. **检查应用日志**：
   - 在 Vercel Dashboard 中查看部署日志
   - 或检查本地开发服务器的控制台
   - 应该能看到 Webhook 处理成功的日志

## 测试环境 vs 正式环境

### 测试环境 (Test Mode)
- Webhook URL: `http://localhost:3000/api/billing/webhook`（本地）
- Webhook Secret: `whsec_test_` 开头
- API Keys: `sk_test_` 和 `pk_test_` 开头
- 用途：开发和测试

### 正式环境 (Live Mode)
- Webhook URL: `https://imgfactorys.vercel.app/api/billing/webhook`
- Webhook Secret: `whsec_` 开头（不是 `whsec_test_`）
- API Keys: `sk_live_` 和 `pk_live_` 开头
- 用途：生产环境，真实支付

## 重要注意事项

1. **不要混用测试和正式环境的 Secret**
   - 测试环境的 Secret 不能用于正式环境
   - 正式环境的 Secret 不能用于测试环境

2. **Webhook Secret 安全**
   - 不要将 Secret 提交到 Git 仓库
   - 不要在前端代码中使用
   - 只在服务端环境变量中使用

3. **多个环境**
   - 如果有多个环境（开发、预览、生产），每个环境都需要独立的 Webhook Endpoint
   - 每个环境都有独立的 Webhook Secret

4. **重新部署**
   - 更新环境变量后，Vercel 会自动重新部署
   - 或者手动触发重新部署以确保新配置生效

## 常见问题

### Q: 如何知道当前使用的是哪个 Webhook Secret？

**A:** 检查环境变量 `STRIPE_WEBHOOK_SECRET` 的值：
- `whsec_test_` 开头 = 测试环境
- `whsec_` 开头（不是 `whsec_test_`）= 正式环境

### Q: 可以同时使用测试和正式环境的 Webhook 吗？

**A:** 可以，但需要：
- 两个独立的 Webhook Endpoint
- 两个不同的环境变量（或根据环境切换）
- 确保代码能正确处理两种 Secret

### Q: Webhook Secret 丢失了怎么办？

**A:** 
1. 在 Stripe Dashboard > Webhooks > 端点详情页
2. 点击 **"Reveal"** 旁边的 **"Reset"** 按钮
3. 会生成新的 Secret
4. **重要**：需要更新所有使用该 Secret 的环境变量

### Q: 如何验证 Webhook 是否正常工作？

**A:**
1. 在 Stripe Dashboard 中查看 Webhook 事件日志
2. 检查事件状态（成功/失败）
3. 查看应用日志确认事件被正确处理
4. 测试实际支付流程

## 下一步

配置完成后：
1. ✅ 重新部署应用（Vercel 会自动部署）
2. ✅ 测试积分购买流程
3. ✅ 验证 Webhook 事件是否正常接收
4. ✅ 检查数据库是否正确更新

## 相关文档

- [Stripe 配置指南](./STRIPE_SETUP.md)
- [Webhook 设置指南](./STRIPE_WEBHOOK_SETUP.md)
- [Vercel 部署配置](./VERCEL_DEPLOYMENT.md)

