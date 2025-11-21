# 环境变量配置完整指南

本文档详细说明所有环境变量的配置方法和注意事项。

---

## 📁 环境变量文件说明

### Next.js 环境变量加载顺序

Next.js 按以下顺序加载环境变量（**后面的会覆盖前面的**）：

1. `.env` - 所有环境共享
2. `.env.local` - 本地开发（**最高优先级**，会覆盖 `.env`）
3. `.env.development` - 开发环境
4. `.env.development.local` - 开发环境本地覆盖
5. `.env.production` - 生产环境

**最佳实践：**
- 使用 `.env.local` 存储本地开发配置（不会被 Git 跟踪）
- 使用 `.env` 存储共享配置或作为模板

### Prisma 环境变量加载

Prisma 有两个使用场景：

1. **Prisma CLI**（命令行工具）：
   - 可能优先读取 `.env` 文件
   - 建议同时更新 `.env` 和 `.env.local`

2. **Prisma Client**（运行时）：
   - 读取 Next.js 加载的环境变量
   - 遵循 Next.js 的优先级（`.env.local` 优先）

---

## 🔐 Supabase 环境变量

### 必需变量

```env
# Supabase 项目 URL（从 Settings > API 获取）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase 匿名密钥（从 Settings > API 获取）
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase 服务角色密钥（从 Settings > API 获取）
# 注意：仅在服务端使用，不要暴露给客户端
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 数据库连接字符串（从 Connect > Session mode 获取）
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

# Shadow 数据库连接字符串（通常与 DATABASE_URL 相同）
SHADOW_DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

### 获取方法

1. **API 密钥**：
   - Supabase Dashboard > Settings > API
   - 复制 Project URL、anon public key、service_role key

2. **数据库连接字符串**：
   - Supabase Dashboard > 点击 "Connect" 按钮
   - 选择 "Session mode" 标签
   - 复制连接字符串

### 重要提示

- ✅ 使用连接池模式（`pooler.supabase.com`），不是直接连接（`db.xxx.supabase.co`）
- ✅ 用户名格式：`postgres.[project-ref]`（不是 `postgres`）
- ✅ 密码格式：通常是 `[project-ref].[random-string]`

---

## 💳 Stripe 环境变量

### 必需变量

```env
# Stripe 密钥（从 Developers > API keys 获取）
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Stripe 公开密钥（从 Developers > API keys 获取）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Stripe Webhook Secret（从 Developers > Webhooks > [Your Endpoint] > Signing secret 获取）
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe 价格 ID（从 Products > [Your Product] > Pricing 获取）
# 注意：这是 Price ID (price_xxx)，不是 Product ID (prod_xxx)
STRIPE_PRICE_BASIC=price_xxxxxxxxxxxxx
STRIPE_PRICE_VIP=price_xxxxxxxxxxxxx
```

### 获取方法

1. **API 密钥**：
   - Stripe Dashboard > Developers > API keys
   - 复制 Publishable key 和 Secret key

2. **Webhook Secret**：
   - Stripe Dashboard > Developers > Webhooks
   - 创建或选择 Webhook 端点
   - 复制 Signing secret

3. **价格 ID**：
   - Stripe Dashboard > Products > 选择产品
   - 在 Pricing 部分找到价格
   - 复制 Price ID（`price_xxx`）

### 重要提示

- ✅ 开发环境使用 `sk_test_` 和 `pk_test_` 开头的密钥
- ✅ 生产环境使用 `sk_live_` 和 `pk_live_` 开头的密钥
- ✅ Webhook Secret 只会显示一次，请立即保存
- ✅ 使用 Price ID（`price_xxx`），不是 Product ID（`prod_xxx`）

---

## 🌐 应用配置变量

```env
# 网站 URL（用于构建重定向 URL）
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 📝 完整配置模板

### `.env.local` 文件模板

```env
# ============================================
# Supabase Configuration
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================
# Supabase Database Configuration
# ============================================
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

# ============================================
# Stripe Configuration
# ============================================
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# ============================================
# Stripe Price IDs
# ============================================
STRIPE_PRICE_BASIC=price_your_basic_price_id_here
STRIPE_PRICE_VIP=price_your_vip_price_id_here

# ============================================
# Application Configuration
# ============================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## ✅ 配置验证清单

### Supabase
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 格式正确（`https://xxx.supabase.co`）
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 已配置
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 已配置
- [ ] `DATABASE_URL` 使用连接池模式（`pooler.supabase.com`）
- [ ] `DATABASE_URL` 用户名格式正确（`postgres.[project-ref]`）
- [ ] `DATABASE_URL` 密码已替换（不是 `[YOUR_PASSWORD]`）

### Stripe
- [ ] `STRIPE_SECRET_KEY` 已配置（`sk_test_` 或 `sk_live_` 开头）
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` 已配置（`pk_test_` 或 `pk_live_` 开头）
- [ ] `STRIPE_WEBHOOK_SECRET` 已配置（`whsec_` 开头）
- [ ] `STRIPE_PRICE_BASIC` 已配置（`price_` 开头）
- [ ] `STRIPE_PRICE_VIP` 已配置（如需要，`price_` 开头）

### 应用
- [ ] `NEXT_PUBLIC_SITE_URL` 已配置
- [ ] 所有变量名大小写正确
- [ ] 所有值没有多余的空格或引号

---

## 🔄 同步配置到多个文件

为了确保所有工具都能正确读取配置，建议同时更新：

1. **`.env.local`** - Next.js 优先读取（本地开发）
2. **`.env`** - Prisma CLI 可能读取

可以使用同步脚本或手动复制配置。

---

## 🚨 安全注意事项

1. **不要提交敏感信息到 Git**
   - `.env.local` 应该添加到 `.gitignore`
   - 只提交 `.env.example` 或 `.env.template`

2. **服务端密钥不要暴露给客户端**
   - `SUPABASE_SERVICE_ROLE_KEY` - 仅在服务端使用
   - `STRIPE_SECRET_KEY` - 仅在服务端使用
   - `STRIPE_WEBHOOK_SECRET` - 仅在服务端使用

3. **客户端变量需要 `NEXT_PUBLIC_` 前缀**
   - `NEXT_PUBLIC_SUPABASE_URL` ✅
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ✅

---

## 📖 相关文档

- [Supabase 快速接入指南](./SUPABASE_QUICK_START.md)
- [Stripe 快速接入指南](./STRIPE_QUICK_START.md)
- [完整接入教程](./INTEGRATION_TUTORIAL.md)

