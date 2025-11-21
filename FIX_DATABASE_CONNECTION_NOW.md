# 立即修复数据库连接错误

## 错误信息

```
Can't reach database server at `db.fbafdgtmmzoqrgrtdkkl.supabase.co`:`5432`
```

## 问题原因

Prisma 正在尝试使用直接连接模式（`db.fbafdgtmmzoqrgrtdkkl.supabase.co:5432`），而不是连接池模式。这说明 `.env.local` 文件可能：
1. 不存在
2. 配置错误
3. 没有被正确加载

## 立即修复步骤

### 步骤 1：检查 `.env.local` 文件

在项目根目录检查是否存在 `.env.local` 文件。

### 步骤 2：创建或更新 `.env.local` 文件

如果文件不存在，创建它；如果存在，确保包含以下配置：

```env
# ============================================
# Database Configuration (重要！)
# ============================================
DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

**关键点：**
- 使用连接池模式：`aws-1-ap-south-1.pooler.supabase.com`（不是 `db.fbafdgtmmzoqrgrtdkkl.supabase.co`）
- 用户名格式：`postgres.fbafdgtmmzoqrgrtdkkl`（不是 `postgres`）
- 端口：`5432`

### 步骤 3：完整配置

确保 `.env.local` 文件包含所有必要的配置（参考 `CREATE_ENV_LOCAL.md`）：

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SUP78E6jQ7bHhFk8SAfQrjHwGujaeA18hmzYeZyisIP49e65vCNDuiws3syI6kiCBpK96Cci1mRlfWXcEZRdCDz00HUqZv5uO
STRIPE_PRICE_BASIC=price_1SUPEqE6jQ7bhHk5Fo2FhDL
STRIPE_WEBHOOK_SECRET=whsec_3e99ccac56d9a18d49d5699d4a6f76410d6a620f45c48d54900190f184422b5e

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://fbafdgtmmzoqrgrtdkkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiYWZkZ3RtbXpvcXJncnRka2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTg5MzcsImV4cCI6MjA3ODkzNDkzN30.TLk4tik2dcKLj77oc1qSTHfYEwaNMaFrSCpYalTh0hg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiYWZkZ3RtbXpvcXJncnRka2tsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM1ODkzNywiZXhwIjoyMDc4OTM0OTM3fQ.TwlWXdizIcmqxb0sQI6j3BHcK64r4bEvfKKVz6PMquw

# Database (连接池模式)
DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Other
REPLICATE_API_KEY=r8_your_replicate_api_key_here
ARK_API_KEY=31cb524e-ad0e-40e1-9588-2b588609c5bf
NEXT_PUBLIC_UPLOAD_API_KEY=free
```

### 步骤 4：重启开发服务器

**重要：** 修改环境变量后，必须完全重启开发服务器：

1. **停止服务器**：在终端中按 `Ctrl+C`（可能需要按两次）
2. **等待完全停止**：确保进程完全退出
3. **重新启动**：
   ```bash
   npm run dev
   ```

### 步骤 5：验证连接

重启后，Prisma 应该能够连接到数据库。如果仍然失败：

1. 检查服务器终端输出，查看 `DATABASE_URL` 的值
2. 确认使用的是连接池模式（`aws-1-ap-south-1.pooler.supabase.com`）
3. 确认不是直接连接模式（`db.fbafdgtmmzoqrgrtdkkl.supabase.co`）

## 常见问题

### Q: 为什么还是使用直接连接？

A: 可能的原因：
1. `.env.local` 文件不存在，Prisma 读取了 `.env` 文件
2. `.env.local` 文件中的 `DATABASE_URL` 配置错误
3. 服务器没有完全重启

### Q: 如何确认配置已加载？

A: 在代码中添加调试日志：
```typescript
console.log('DATABASE_URL:', process.env.DATABASE_URL);
```

查看服务器终端输出，确认使用的是连接池模式。

## 快速检查清单

- [ ] `.env.local` 文件存在
- [ ] `DATABASE_URL` 使用连接池模式（`aws-1-ap-south-1.pooler.supabase.com`）
- [ ] 用户名格式正确（`postgres.fbafdgtmmzoqrgrtdkkl`）
- [ ] 密码正确（`liuhanci2002`）
- [ ] 已完全重启开发服务器
- [ ] 服务器终端显示正确的 `DATABASE_URL`

