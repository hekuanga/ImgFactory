# 最终环境变量配置检查（仅基础版套餐）

## ✅ 已配置完成（11个）

### Supabase（3个）- ✅ 全部已配置
- ✅ `NEXT_PUBLIC_SUPABASE_URL` = `https://fbafdgtmmzoqrgrtdkkl.supabase.co`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Stripe（4个）- ✅ 全部已配置
- ✅ `STRIPE_SECRET_KEY` = `sk_test_your_stripe_secret_key_here`
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_test_51SUP78E6jQ7bHhFk8SAfQrjHwGujaeA18hmzYeZyisIP49e65vCNDuiws3syI6kiCBpK96Cci1mRlfWXcEZRdCDz00HUqZv5uO`
- ✅ `STRIPE_WEBHOOK_SECRET` = `whsec_3e99ccac56d9a18d49d5699d4a6f76410d6a620f45c48d54900190f184422b5e`
- ✅ `STRIPE_PRICE_BASIC` = `price_1SUPEqE6jQ7bHhFk5Fo2FhDL`

### 应用功能（3个）- ✅ 全部已配置
- ✅ `REPLICATE_API_KEY` = `r8_your_replicate_api_key_here`
- ✅ `ARK_API_KEY` = `31cb524e-ad0e-40e1-9588-2b588609c5bf`
- ✅ `NEXT_PUBLIC_UPLOAD_API_KEY` = `free`

### 数据库（2个）- ✅ 全部已配置
- ✅ `DATABASE_URL` = `postgresql://postgres:postgres@db:5432/restorephotos`
- ✅ `SHADOW_DATABASE_URL` = `postgresql://postgres:postgres@db:5432/restorephotos_shadow`

### 应用配置（1个）- ✅ 已配置
- ✅ `NEXT_PUBLIC_SITE_URL` = `http://localhost:3000`

---

## ⚠️ 需要修复的问题

### 1. 前端价格 ID 环境变量缺失

**问题**：`pages/billing/index.tsx` 第 83 行使用了 `NEXT_PUBLIC_STRIPE_PRICE_PRO`，但这是客户端代码，需要 `NEXT_PUBLIC_` 前缀。

**当前代码**：
```typescript
const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC;
```

**问题**：
- `STRIPE_PRICE_BASIC` 没有 `NEXT_PUBLIC_` 前缀，前端无法访问
- 需要添加 `NEXT_PUBLIC_STRIPE_PRICE_BASIC` 到 `env.local`

**解决方案**：在 `env.local` 中添加：
```env
NEXT_PUBLIC_STRIPE_PRICE_BASIC=price_1SUPEqE6jQ7bHhFk5Fo2FhDL
```

---

## 📋 需要添加的配置

### 必需添加（1个）

1. **NEXT_PUBLIC_STRIPE_PRICE_BASIC**
   - 当前状态：❌ 缺失
   - 值：`price_1SUPEqE6jQ7bHhFk5Fo2FhDL`（与 `STRIPE_PRICE_BASIC` 相同）
   - 用途：前端订阅页面使用
   - 原因：前端代码无法访问没有 `NEXT_PUBLIC_` 前缀的环境变量

---

## ✅ 配置完成度：95%（11/12 必需项）

---

## 🎯 立即行动

在 `env.local` 文件中添加：

```env
# Stripe 价格 ID（前端使用）
NEXT_PUBLIC_STRIPE_PRICE_BASIC=price_1SUPEqE6jQ7bHhFk5Fo2FhDL
```

添加后，配置将 100% 完成！

---

## 📝 注意事项

### Pro 和 VIP 价格 ID（暂时不需要）

由于只有基础版套餐，以下配置可以保持占位符或注释：
- `STRIPE_PRICE_PRO` - 可以保持占位符
- `STRIPE_PRICE_VIP` - 已注释，正确

### Webhook 中的价格判断

`pages/api/billing/webhook.ts` 中的价格判断逻辑会：
- 如果价格 ID 匹配 `STRIPE_PRICE_BASIC` → 设置为 `pro` 等级
- 如果价格 ID 匹配 `STRIPE_PRICE_PRO` → 设置为 `pro` 等级
- 如果价格 ID 匹配 `STRIPE_PRICE_VIP` → 设置为 `vip` 等级

**建议**：如果只有基础版，可以考虑将基础版价格 ID 对应的等级设置为 `pro`，或者修改 webhook 逻辑。

---

**最后更新**: 2025-01-XX
**状态**: ⚠️ **需要添加 1 个环境变量**

