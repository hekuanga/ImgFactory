# 邮箱验证404错误修复指南

## 问题描述

点击邮箱验证链接后，跳转页面显示404错误。

## 可能的原因

1. **Supabase Redirect URLs 未配置**
   - Supabase Dashboard 中没有添加正确的重定向 URL
   
2. **邮箱模板配置错误**
   - 邮箱模板中的重定向 URL 配置不正确
   
3. **环境变量未设置**
   - `NEXT_PUBLIC_SITE_URL` 环境变量未正确设置

## 解决步骤

### 1. 检查 Supabase Dashboard 配置

#### 步骤 1.1：配置 Site URL

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Authentication** > **URL Configuration**
4. 设置 **Site URL**：
   - **生产环境**：`https://imgfactorys.vercel.app`
   - **开发环境**：`http://localhost:3000`

#### 步骤 1.2：配置 Redirect URLs

在 **Redirect URLs** 中添加以下 URL（每行一个）：

**生产环境：**
```
https://imgfactorys.vercel.app/auth/callback
https://imgfactorys.vercel.app/verify-email
https://imgfactorys.vercel.app
```

**开发环境：**
```
http://localhost:3000/auth/callback
http://localhost:3000/verify-email
http://localhost:3000
```

**重要**：确保同时添加生产环境和开发环境的 URL，方便测试。

### 2. 检查邮箱模板配置

1. 进入 **Authentication** > **Email Templates**
2. 选择 **Confirm signup** 模板
3. 检查验证链接的格式

**推荐配置（使用 ConfirmationURL）：**
```html
<a href="{{ .ConfirmationURL }}">确认邮箱</a>
```

`{{ .ConfirmationURL }}` 会自动包含：
- 重定向 URL（从 `emailRedirectTo` 参数获取）
- 验证 token
- 正确的格式

**或者使用 SiteURL（需要手动配置）：**
```html
<a href="{{ .SiteURL }}/auth/callback?token={{ .TokenHash }}&type=email">确认邮箱</a>
```

### 3. 检查环境变量

确保在 Vercel 项目设置中配置了以下环境变量：

```env
NEXT_PUBLIC_SITE_URL=https://imgfactorys.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 验证配置

1. **注册新账户**
   - 访问注册页面并注册
   
2. **检查邮箱**
   - 查看收件箱中的验证邮件
   - **验证链接格式应该是**：
     ```
     https://imgfactorys.vercel.app/auth/callback#access_token=...&refresh_token=...
     ```
     或
     ```
     https://imgfactorys.vercel.app/verify-email?token_hash=...&type=email
     ```

3. **点击验证链接**
   - 应该跳转到 `/auth/callback` 或 `/verify-email` 页面
   - 不应该显示404错误

## 常见问题排查

### Q1: 仍然显示404错误

**检查清单：**
- [ ] Supabase Dashboard 中的 **Redirect URLs** 是否包含完整URL（包括协议 `https://`）
- [ ] **Site URL** 是否设置为正确的域名
- [ ] Vercel 环境变量 `NEXT_PUBLIC_SITE_URL` 是否正确设置
- [ ] 邮箱模板中的链接格式是否正确

### Q2: 验证链接格式不对

**问题**：验证链接指向了错误的URL

**解决**：
- 检查 `services/auth.ts` 中的 `emailRedirectTo` 配置
- 确保 `getAuthCallbackUrl()` 返回正确的URL
- 检查邮箱模板是否使用了 `{{ .ConfirmationURL }}`

### Q3: 本地正常，Vercel部署后404

**问题**：本地开发正常，但部署到Vercel后出现404

**解决**：
1. 确保 Vercel 环境变量中设置了 `NEXT_PUBLIC_SITE_URL`
2. 确保 Supabase Dashboard 中添加了 Vercel 域名的重定向 URL
3. 重新部署应用（环境变量更改后需要重新部署）

### Q4: 验证链接被拦截

**问题**：点击验证链接后显示"重定向被拦截"

**解决**：
- 检查 Supabase Dashboard 中的 **Redirect URLs** 配置
- 确保重定向 URL 完全匹配（包括协议、域名、路径）
- 检查是否有拼写错误或多余的空格

## 调试技巧

### 1. 检查浏览器控制台

打开浏览器开发者工具（F12），查看：
- Console 标签：是否有错误信息
- Network 标签：请求是否成功，状态码是什么

### 2. 检查验证链接格式

复制验证邮件中的链接，检查：
- URL 格式是否正确
- 是否包含必要的参数（`access_token` 或 `token_hash`）
- 域名是否正确

### 3. 检查 Supabase 日志

1. 进入 Supabase Dashboard
2. 进入 **Authentication** > **Logs**
3. 查看最近的认证日志，检查是否有错误

### 4. 测试验证流程

1. 注册一个新账户
2. 复制验证邮件中的链接
3. 在浏览器中直接访问链接
4. 检查是否跳转到正确的页面

## 代码说明

代码中已经自动处理了重定向 URL：

- **`lib/getSiteUrl.ts`**：自动检测当前站点 URL（支持 Vercel 环境）
- **`services/auth.ts`**：注册时自动设置 `emailRedirectTo: getAuthCallbackUrl()`
- **`pages/auth/callback.tsx`**：处理验证回调并设置 session
- **`pages/verify-email.tsx`**：备用验证页面（处理 OTP 格式的验证链接）

只需要在 Supabase Dashboard 中配置允许的重定向 URL 即可。

## 快速修复

如果急需修复，可以：

1. **临时方案**：在 Supabase Dashboard 中禁用邮箱验证
   - 进入 **Authentication** > **Settings**
   - 取消勾选 **"Enable email confirmations"**
   - 保存设置
   - **注意**：这仅适用于开发环境，生产环境不建议禁用

2. **永久方案**：按照上述步骤正确配置重定向 URL

## 联系支持

如果按照上述步骤仍然无法解决问题，请提供：
- Supabase Dashboard 中的 Redirect URLs 配置截图
- 验证邮件中的链接示例（隐藏敏感信息）
- 浏览器控制台的错误信息
- Vercel 部署日志中的错误信息

