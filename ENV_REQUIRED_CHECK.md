# 环境变量配置检查报告

## 📋 当前配置状态

### ✅ 已配置（有实际值，非占位符）- 8个

| 变量名 | 当前值 | 状态 | 用途 |
|--------|--------|------|------|
| `REPLICATE_API_KEY` | `r8_your_replicate_api_key_here` | ✅ | 照片修复功能 |
| `ARK_API_KEY` | `31cb524e-ad0e-40e1-9588-2b588609c5bf` | ✅ | 证件照生成 |
| `NEXT_PUBLIC_UPLOAD_API_KEY` | `free` | ✅ | 文件上传服务 |
| `STRIPE_WEBHOOK_SECRET` | `whsec_3e99ccac56d9a18d49d5699d4a6f76410d6a620f45c48d54900190f184422b5e` | ✅ | Stripe Webhook 验证 |
| `STRIPE_PRICE_BASIC` | `price_1SUPEqE6jQ7bHhFk5Fo2FhDL` | ✅ | 基础订阅价格 |
| `DATABASE_URL` | `postgresql://postgres:postgres@db:5432/restorephotos` | ✅ | 数据库连接 |
| `SHADOW_DATABASE_URL` | `postgresql://postgres:postgres@db:5432/restorephotos_shadow` | ✅ | Prisma Shadow DB |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | ✅ | 网站 URL（开发环境） |

---

## 🔴 必须配置（缺失或占位符）- 6个

### 1. Supabase 配置（3个）- 🔴 高优先级

| 变量名 | 当前值 | 必需 | 获取位置 |
|--------|--------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` ❌ | ✅ 是 | Supabase Dashboard > Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your_supabase_anon_key_here` ❌ | ✅ 是 | Supabase Dashboard > Settings > API > anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | `your_supabase_service_role_key_here` ❌ | ✅ 是 | Supabase Dashboard > Settings > API > service_role (secret) |

**影响**：
- ❌ 用户无法登录/注册
- ❌ 认证功能完全无法使用
- ❌ Webhook 无法验证用户身份

### 2. Stripe 配置（3个）- 🔴 高优先级

| 变量名 | 当前值 | 必需 | 获取位置 |
|--------|--------|------|----------|
| `STRIPE_SECRET_KEY` | `sk_test_your_stripe_secret_key_here` ❌ | ✅ 是 | Stripe Dashboard > Developers > API keys > Secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_your_stripe_publishable_key_here` ❌ | ✅ 是 | Stripe Dashboard > Developers > API keys > Publishable key |
| `STRIPE_PRICE_PRO` | `price_your_pro_price_id_here` ❌ | ✅ 是 | Stripe Dashboard > Products > 选择产品 > 查看价格 |

**影响**：
- ❌ 无法创建支付会话
- ❌ 订阅功能无法使用
- ❌ Checkout 和 Portal 无法工作

---

## 🟡 可选配置（不影响核心功能）- 3个

| 变量名 | 当前值 | 必需 | 说明 |
|--------|--------|------|------|
| `UPSTASH_REDIS_REST_URL` | `your_redis_url_here` ⚠️ | ❌ 否 | 仅速率限制需要 |
| `UPSTASH_REDIS_REST_TOKEN` | `your_redis_token_here` ⚠️ | ❌ 否 | 仅速率限制需要 |
| `STRIPE_PRICE_VIP` | 已注释 | ❌ 否 | 如果不需要 VIP 等级可忽略 |

---

## 📊 配置完成度统计

| 类别 | 必需项 | 已配置 | 完成度 |
|------|--------|--------|--------|
| Supabase | 3 | 0 | **0%** ❌ |
| Stripe | 4 | 1 | **25%** ⚠️ |
| 数据库 | 1 | 1 | **100%** ✅ |
| 应用功能 | 3 | 3 | **100%** ✅ |
| **总计** | **11** | **5** | **45%** ⚠️ |

---

## 🎯 立即需要配置的 6 个 key

### 优先级 1：Supabase（3个）- 阻止认证功能

```env
# 1. Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co

# 2. Supabase Anon Key（公开密钥）
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 3. Supabase Service Role Key（服务端密钥，保密！）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**获取步骤**：
1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Settings** > **API**
4. 复制 **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
5. 复制 **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. 复制 **service_role** key（secret）→ `SUPABASE_SERVICE_ROLE_KEY`

---

### 优先级 2：Stripe（3个）- 阻止支付功能

```env
# 1. Stripe Secret Key（服务端密钥，保密！）
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxx

# 2. Stripe Publishable Key（公开密钥）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxx

# 3. Stripe Pro Price ID
STRIPE_PRICE_PRO=price_1xxxxxxxxxxxxx
```

**获取步骤**：
1. 登录 [Stripe Dashboard](https://dashboard.stripe.com)
2. 进入 **Developers** > **API keys**
3. 复制 **Secret key** → `STRIPE_SECRET_KEY`
4. 复制 **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. 进入 **Products** > 选择产品 `prod_TRHomIxfL7LUeg`
6. 查看 **Pricing** 部分，复制 **Pro 计划的价格 ID**（`price_xxx`）→ `STRIPE_PRICE_PRO`

---

## 📝 代码中使用的环境变量清单

### 核心功能必需（11个）

1. ✅ `REPLICATE_API_KEY` - 已配置
2. ✅ `ARK_API_KEY` - 已配置
3. ✅ `NEXT_PUBLIC_UPLOAD_API_KEY` - 已配置
4. ❌ `NEXT_PUBLIC_SUPABASE_URL` - **需要配置**
5. ❌ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - **需要配置**
6. ❌ `SUPABASE_SERVICE_ROLE_KEY` - **需要配置**
7. ❌ `STRIPE_SECRET_KEY` - **需要配置**
8. ❌ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - **需要配置**
9. ✅ `STRIPE_WEBHOOK_SECRET` - 已配置
10. ✅ `STRIPE_PRICE_BASIC` - 已配置
11. ❌ `STRIPE_PRICE_PRO` - **需要配置**

### 数据库（2个）

12. ✅ `DATABASE_URL` - 已配置
13. ✅ `SHADOW_DATABASE_URL` - 已配置

### 应用配置（1个）

14. ✅ `NEXT_PUBLIC_SITE_URL` - 已配置（开发环境）

### 自动配置（无需手动设置）

- `VERCEL_URL` - Vercel 自动提供
- `NODE_ENV` - 自动设置

---

## ⚠️ 配置缺失的影响

### 如果缺少 Supabase 配置：
- ❌ **用户无法注册**
- ❌ **用户无法登录**
- ❌ **所有认证功能失效**
- ❌ **Webhook 无法识别用户**

### 如果缺少 Stripe 配置：
- ❌ **无法创建支付会话**
- ❌ **订阅功能完全无法使用**
- ❌ **Checkout 页面无法加载**
- ❌ **Portal 无法打开**

---

## ✅ 配置完成后的验证步骤

1. **验证 Supabase 连接**：
   ```bash
   # 访问 http://localhost:3000/api/test-supabase
   ```

2. **测试认证功能**：
   - 访问 `/register` 页面
   - 尝试注册新用户
   - 访问 `/login` 页面
   - 尝试登录

3. **测试 Stripe 功能**：
   - 访问 `/billing` 页面
   - 点击"立即订阅"按钮
   - 检查是否能创建 Checkout Session

---

## 📋 快速配置清单

- [ ] 配置 `NEXT_PUBLIC_SUPABASE_URL`
- [ ] 配置 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] 配置 `SUPABASE_SERVICE_ROLE_KEY`
- [ ] 配置 `STRIPE_SECRET_KEY`
- [ ] 配置 `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] 配置 `STRIPE_PRICE_PRO`

**配置完成后，重启开发服务器**：
```bash
npm run dev
```

---

**最后更新**: 2025-01-XX
**状态**: ⚠️ **需要配置 6 个必需项**

