# Vercel 环境变量配置指南

## 问题：本地正常，但 Vercel 部署后不正常

这是一个常见的部署问题，通常与环境变量配置有关。

## 快速检查清单

### ✅ 1. 确认环境变量已设置

在 Vercel Dashboard 中：

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 选择你的项目
3. 进入 **Settings** > **Environment Variables**
4. 确认以下变量已设置：

**必需的环境变量：**
```
NEXT_PUBLIC_SUPABASE_URL=https://fbafdgtmmzoqrgrtdkkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

**其他可能需要的变量：**
```
NEXT_PUBLIC_SITE_URL=https://imgfactorys.vercel.app
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### ✅ 2. 确认环境变量作用域

在 Vercel 中，每个环境变量都有作用域：

- **Production** - 生产环境（必须设置）
- **Preview** - 预览环境（可选）
- **Development** - 开发环境（可选）

**重要：** 确保所有 `NEXT_PUBLIC_*` 变量都设置了 **Production** 作用域！

### ✅ 3. 重新部署

更新环境变量后：

1. 进入 **Deployments** 标签
2. 点击最新部署右侧的 **"..."** 菜单
3. 选择 **"Redeploy"**
4. 或者推送新的代码触发自动部署

## 常见问题

### 问题 1: 环境变量未设置

**症状：**
- 本地正常
- Vercel 部署后显示 "NetworkError"
- 浏览器控制台显示配置错误

**解决方案：**
1. 在 Vercel Dashboard 中添加所有必需的环境变量
2. 确保作用域设置为 **Production**
3. 重新部署

### 问题 2: 环境变量值错误

**症状：**
- 环境变量已设置，但仍然报错
- 可能是 URL 或 Key 错误

**解决方案：**
1. 从 Supabase Dashboard 重新获取正确的值
2. 在 Vercel 中更新环境变量
3. 重新部署

### 问题 3: 环境变量作用域错误

**症状：**
- 环境变量已设置，但只在某些环境可用
- Preview 部署失败，但 Production 正常（或反之）

**解决方案：**
1. 检查每个环境变量的作用域设置
2. 确保 Production 环境的所有变量都已设置
3. 如果需要，也为 Preview 和 Development 设置

### 问题 4: 构建时环境变量未注入

**症状：**
- 环境变量已设置
- 但代码中 `process.env.NEXT_PUBLIC_*` 返回 `undefined`

**解决方案：**
1. 确认变量名以 `NEXT_PUBLIC_` 开头（客户端变量）
2. 重新部署（环境变量更改后必须重新部署）
3. 检查 `next.config.js` 是否有特殊配置

## 验证环境变量

### 方法 1: 检查 Vercel 构建日志

1. 在 Vercel Dashboard 中进入 **Deployments**
2. 点击最新的部署
3. 查看 **Build Logs**
4. 搜索环境变量相关的日志

### 方法 2: 在代码中临时输出（仅用于调试）

在 `pages/login.tsx` 或 `pages/register.tsx` 中添加：

```typescript
useEffect(() => {
  // 仅在开发环境或调试时使用
  if (process.env.NODE_ENV === 'development') {
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }
}, []);
```

**注意：** 调试完成后记得删除这些代码！

### 方法 3: 使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 查看环境变量
vercel env ls

# 拉取环境变量到本地（用于测试）
vercel env pull .env.local
```

## 环境变量设置步骤（详细）

### 步骤 1: 获取 Supabase 配置

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择项目
3. 进入 **Settings** > **API**
4. 复制：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 步骤 2: 在 Vercel 中设置

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 选择项目
3. 进入 **Settings** > **Environment Variables**
4. 点击 **"Add New"**
5. 填写：
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: `https://fbafdgtmmzoqrgrtdkkl.supabase.co`
   - **Environment**: 选择 **Production**（必须！）
6. 点击 **"Save"**
7. 重复步骤 4-6 添加 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 步骤 3: 重新部署

1. 进入 **Deployments** 标签
2. 点击最新部署的 **"..."** 菜单
3. 选择 **"Redeploy"**
4. 等待部署完成

## 检查清单

部署前确认：

- [ ] `NEXT_PUBLIC_SUPABASE_URL` 已设置
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 已设置
- [ ] 两个变量的作用域都包含 **Production**
- [ ] 变量值正确（从 Supabase Dashboard 复制）
- [ ] 已重新部署应用

## 调试技巧

### 1. 检查浏览器控制台

部署后，在浏览器中：

1. 打开开发者工具（F12）
2. 进入 **Console** 标签
3. 查看是否有环境变量相关的错误

### 2. 检查网络请求

1. 进入 **Network** 标签
2. 尝试登录/注册
3. 查看失败的请求：
   - URL 是否正确（应该是 Supabase URL）
   - 状态码是什么
   - 错误信息是什么

### 3. 检查 Vercel 日志

1. 在 Vercel Dashboard 中进入 **Deployments**
2. 点击部署查看日志
3. 查看是否有构建错误或运行时错误

## 如果仍然无法解决

1. **收集信息：**
   - 浏览器控制台错误
   - Network 标签中的失败请求
   - Vercel 构建日志
   - Vercel 运行时日志

2. **验证 Supabase：**
   - 确认 Supabase 项目正常运行
   - 检查 Supabase Dashboard 中的项目状态

3. **联系支持：**
   - 提供收集的信息
   - 说明本地正常但 Vercel 部署后不正常

## 预防措施

1. **使用 `.env.example` 文件**：列出所有必需的环境变量
2. **文档化环境变量**：在 README 中说明需要哪些变量
3. **自动化检查**：在 CI/CD 中检查环境变量
4. **定期检查**：定期验证 Vercel 中的环境变量

