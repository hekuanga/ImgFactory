# Vercel 环境变量配置指南

## 问题描述

在 Vercel 部署后出现以下错误：
- `Error: Missing Supabase environment variables in production`
- 登录和注册功能无法正常工作

## 解决方案

### 1. 在 Vercel Dashboard 中配置环境变量

#### 步骤 1：登录 Vercel Dashboard

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目

#### 步骤 2：进入环境变量设置

1. 点击项目名称进入项目详情
2. 点击 **Settings** 标签
3. 在左侧菜单中找到 **Environment Variables**

#### 步骤 3：添加必需的环境变量

点击 **Add New** 按钮，逐个添加以下环境变量：

##### 必需的环境变量

1. **NEXT_PUBLIC_SUPABASE_URL**
   - **Value**: 你的 Supabase 项目 URL
   - **Environment**: 选择 `Production`, `Preview`, `Development`（全选）
   - **示例**: `https://xxxxx.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - **Value**: 你的 Supabase Anon Key
   - **Environment**: 选择 `Production`, `Preview`, `Development`（全选）
   - **示例**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **SUPABASE_SERVICE_ROLE_KEY**（可选，但推荐）
   - **Value**: 你的 Supabase Service Role Key
   - **Environment**: 选择 `Production`, `Preview`, `Development`（全选）
   - **注意**: 这是敏感密钥，不要暴露到客户端

##### 其他可能需要的环境变量

4. **DATABASE_URL**
   - **Value**: PostgreSQL 数据库连接字符串
   - **Environment**: 选择 `Production`, `Preview`, `Development`（全选）

5. **ARK_API_KEY**（如果使用方舟 SDK）
   - **Value**: 方舟 SDK API 密钥
   - **Environment**: 选择 `Production`, `Preview`, `Development`（全选）

6. **REPLICATE_API_KEY**（如果使用 Replicate）
   - **Value**: Replicate API 密钥
   - **Environment**: 选择 `Production`, `Preview`, `Development`（全选）

7. **STRIPE_SECRET_KEY**（如果使用 Stripe）
   - **Value**: Stripe Secret Key
   - **Environment**: 选择 `Production`（仅生产环境）

8. **STRIPE_WEBHOOK_SECRET**（如果使用 Stripe Webhook）
   - **Value**: Stripe Webhook Secret
   - **Environment**: 选择 `Production`（仅生产环境）

9. **NEXT_PUBLIC_SITE_URL**（推荐）
   - **Value**: 你的 Vercel 部署域名
   - **Environment**: 选择 `Production`, `Preview`（不选 Development）
   - **示例**: `https://your-project.vercel.app`

### 2. 获取 Supabase 环境变量

#### 步骤 1：登录 Supabase Dashboard

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目

#### 步骤 2：获取 API 密钥

1. 进入 **Settings** > **API**
2. 找到 **Project URL**，复制作为 `NEXT_PUBLIC_SUPABASE_URL`
3. 找到 **anon public** key，复制作为 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 找到 **service_role** key，复制作为 `SUPABASE_SERVICE_ROLE_KEY`
   - **注意**: Service Role Key 有完整权限，请妥善保管

### 3. 验证环境变量配置

#### 方法 1：检查 Vercel 部署日志

1. 在 Vercel Dashboard 中查看最新的部署
2. 点击部署查看构建日志
3. 确认没有 `Missing Supabase environment variables` 错误

#### 方法 2：使用测试 API（如果已创建）

访问：`https://your-project.vercel.app/api/test-supabase`

应该返回：
```json
{
  "success": true,
  "clientConfig": {
    "url": "https://xxxxx.supabase.co...",
    "hasAnonKey": true,
    "hasServiceRoleKey": true
  }
}
```

### 4. 重新部署

配置环境变量后：

1. **自动重新部署**：Vercel 会自动检测到环境变量变化并重新部署
2. **手动触发部署**：在 Vercel Dashboard 中点击 **Redeploy**

### 5. 环境变量作用域

在添加环境变量时，可以选择以下环境：

- **Production**: 生产环境（主域名）
- **Preview**: 预览环境（Pull Request 预览）
- **Development**: 开发环境（本地开发）

**建议**：
- Supabase 相关变量：全选（Production, Preview, Development）
- Stripe 相关变量：仅 Production
- 其他敏感变量：根据需要使用

## 常见问题

### Q1: 为什么本地正常，但 Vercel 部署后出错？

**A**: 本地环境变量存储在 `.env.local` 文件中，但 Vercel 需要单独配置环境变量。Vercel 不会自动读取 `.env.local` 文件。

### Q2: 环境变量配置后仍然报错？

**A**: 检查以下几点：
1. 环境变量名称是否正确（区分大小写）
2. 是否选择了正确的环境（Production/Preview/Development）
3. 是否重新部署了应用
4. 检查 Vercel 部署日志中的实际环境变量值（注意：敏感值会被隐藏）

### Q3: 如何确认环境变量已正确加载？

**A**: 
1. 查看 Vercel 部署日志
2. 在代码中添加临时日志（仅开发环境）
3. 使用测试 API 端点

### Q4: 环境变量值包含特殊字符怎么办？

**A**: 
- 不需要转义，直接粘贴完整值
- 确保没有多余的空格或换行符
- 如果值很长，使用 Vercel CLI 或 API 设置

### Q5: 如何批量导入环境变量？

**A**: 
1. 使用 Vercel CLI：
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   ```
2. 使用 Vercel API
3. 在 Dashboard 中逐个添加（推荐，更安全）

## 安全检查

### ⚠️ 重要提示

1. **不要将敏感密钥提交到 Git**
   - `.env.local` 应该在 `.gitignore` 中
   - 不要在代码中硬编码密钥

2. **区分公开和私有变量**
   - `NEXT_PUBLIC_*` 变量会暴露到客户端
   - 不要将 Service Role Key 设置为 `NEXT_PUBLIC_*`

3. **定期轮换密钥**
   - 定期更新 API 密钥
   - 如果密钥泄露，立即在 Supabase Dashboard 中重置

## 相关文档

- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase 配置指南](./SUPABASE_SETUP.md)
- [Vercel 部署指南](./VERCEL_DEPLOYMENT.md)

## 快速检查清单

- [ ] `NEXT_PUBLIC_SUPABASE_URL` 已配置
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 已配置
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 已配置（可选）
- [ ] 环境变量已选择正确的环境（Production/Preview/Development）
- [ ] 已重新部署应用
- [ ] 部署日志中没有环境变量相关错误
- [ ] 登录/注册功能正常工作
