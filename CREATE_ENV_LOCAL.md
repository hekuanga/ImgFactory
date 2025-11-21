# 创建 .env.local 文件指南

## 问题

环境变量 `STRIPE_PRICE_BASIC` 没有被加载，导致订阅功能显示 "Price configuration not found"。

## 解决方案

### 步骤 1：创建或编辑 `.env.local` 文件

在项目根目录创建或编辑 `.env.local` 文件（注意文件名前面有点）。

### 步骤 2：添加以下内容

将以下内容复制到 `.env.local` 文件中：

```env
# ============================================
# Stripe Configuration
# ============================================
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SUP78E6jQ7bHhFk8SAfQrjHwGujaeA18hmzYeZyisIP49e65vCNDuiws3syI6kiCBpK96Cci1mRlfWXcEZRdCDz00HUqZv5uO
STRIPE_PRICE_BASIC=price_1SUPEqE6jQ7bhHk5Fo2FhDL
STRIPE_WEBHOOK_SECRET=whsec_3e99ccac56d9a18d49d5699d4a6f76410d6a620f45c48d54900190f184422b5e

# ============================================
# Supabase Configuration
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://fbafdgtmmzoqrgrtdkkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiYWZkZ3RtbXpvcXJncnRka2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTg5MzcsImV4cCI6MjA3ODkzNDkzN30.TLk4tik2dcKLj77oc1qSTHfYEwaNMaFrSCpYalTh0hg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiYWZkZ3RtbXpvcXJncnRka2tsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM1ODkzNywiZXhwIjoyMDc4OTM0OTM3fQ.TwlWXdizIcmqxb0sQI6j3BHcK64r4bEvfKKVz6PMquw

# ============================================
# Database Configuration
# ============================================
DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

# ============================================
# Application Configuration
# ============================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ============================================
# Other Configurations
# ============================================
REPLICATE_API_KEY=r8_your_replicate_api_key_here
ARK_API_KEY=31cb524e-ad0e-40e1-9588-2b588609c5bf
NEXT_PUBLIC_UPLOAD_API_KEY=free
```

### 步骤 3：保存文件

确保文件保存为 `.env.local`（注意前面的点）。

### 步骤 4：重启开发服务器

**重要：** 修改环境变量后，必须重启开发服务器才能生效。

1. 停止当前服务器：在终端中按 `Ctrl+C`
2. 重新启动：
   ```bash
   npm run dev
   ```

### 步骤 5：验证配置

重启后，访问以下 URL 验证环境变量是否已加载：

```
http://localhost:3000/api/test-env
```

应该看到：
```json
{
  "success": true,
  "stripePriceBasic": "price_1SUPEqE6jQ7bHhFk5Fo2FhDL",
  "nodeEnv": "development"
}
```

如果 `stripePriceBasic` 有值，说明配置成功！

### 步骤 6：测试订阅功能

配置成功后，再次尝试订阅功能，应该不再显示 "Price configuration not found" 错误。

## 重要提示

1. **文件名**：必须是 `.env.local`（前面有点），不是 `env.local`
2. **文件位置**：必须在项目根目录（与 `package.json` 同级）
3. **重启服务器**：修改环境变量后必须重启开发服务器
4. **不要提交到 Git**：`.env.local` 文件包含敏感信息，应该添加到 `.gitignore`

## 如果仍然失败

1. 检查文件名是否正确（`.env.local`）
2. 检查文件是否在项目根目录
3. 检查变量名是否正确（`STRIPE_PRICE_BASIC`）
4. 确保已重启开发服务器
5. 查看服务器终端输出，检查是否有环境变量相关的错误

