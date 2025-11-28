# Vercel 部署配置指南

## Supabase 重定向 URL 配置

部署到 Vercel 后，需要在 Supabase Dashboard 中配置正确的重定向 URL，否则登录和注册时的重定向会被拦截。

### 配置步骤

1. **登录 Supabase Dashboard**
   - 访问 [Supabase Dashboard](https://app.supabase.com)
   - 选择你的项目

2. **配置 Site URL**
   - 进入 **Authentication** > **URL Configuration**
   - 设置 **Site URL** 为你的 Vercel 域名：
     ```
     https://imgfactorys.vercel.app
     ```

3. **配置 Redirect URLs**
   - 在 **Redirect URLs** 中添加以下 URL（每行一个）：
     ```
     https://imgfactorys.vercel.app/auth/callback
     https://imgfactorys.vercel.app/verify-email
     https://imgfactorys.vercel.app
     http://localhost:3000/auth/callback
     http://localhost:3000/verify-email
     http://localhost:3000
     ```
   - **注意**：同时保留本地开发环境的 URL，方便本地测试

4. **配置邮箱验证模板**
   - 进入 **Authentication** > **Email Templates**
   - 选择 **Confirm signup** 模板
   - 使用推荐的模板代码（见 [邮箱模板配置指南](./EMAIL_TEMPLATE_SETUP.md)）
   - 重要：使用 `{{ .ConfirmationURL }}` 变量（不是 `{{ .SiteURL }}`）
   - `{{ .ConfirmationURL }}` 会自动包含重定向URL和验证token

5. **保存配置**
   - 点击 **Save** 保存所有配置

### 环境变量配置

确保在 Vercel 项目设置中配置了以下环境变量：

```env
NEXT_PUBLIC_SITE_URL=https://imgfactorys.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 验证配置

1. **注册新账户**
   - 访问 `https://imgfactorys.vercel.app/register`
   - 填写邮箱和密码并注册

2. **检查邮箱**
   - 查看收件箱中的验证邮件
   - 验证邮件中的链接应该指向：`https://imgfactorys.vercel.app/auth/callback#access_token=...`

3. **点击验证链接**
   - 应该自动跳转到网站并登录成功
   - 如果显示"重定向被拦截"，说明 Supabase Dashboard 中的配置不正确

### 常见问题

**Q: 点击验证链接后显示"重定向被拦截"**

**A:** 检查：
- Supabase Dashboard 中的 **Redirect URLs** 是否包含 `https://imgfactorys.vercel.app/auth/callback`
- **Site URL** 是否设置为 `https://imgfactorys.vercel.app`
- 环境变量 `NEXT_PUBLIC_SITE_URL` 是否正确设置

**Q: 本地开发正常，但 Vercel 部署后重定向失败**

**A:** 
- 确保 Vercel 环境变量中设置了 `NEXT_PUBLIC_SITE_URL`
- 确保 Supabase Dashboard 中添加了 Vercel 域名的重定向 URL

**Q: 如何同时支持多个域名？**

**A:** 在 Supabase Dashboard 的 **Redirect URLs** 中添加所有需要的域名：
```
https://imgfactorys.vercel.app/auth/callback
https://your-custom-domain.com/auth/callback
http://localhost:3000/auth/callback
```

### 代码说明

代码中已经自动处理了重定向 URL 的配置：

- `lib/getSiteUrl.ts`: 自动检测当前站点 URL（支持 Vercel 环境）
- `pages/register.tsx`: 注册时自动设置 `emailRedirectTo`
- `services/auth.ts`: 注册和重置密码时自动设置重定向 URL

只需要在 Supabase Dashboard 中配置允许的重定向 URL 即可。

