# Supabase 重定向 URL 配置指南

## 问题：验证后无法登录

如果点击验证链接后仍然无法登录，可能是因为 Supabase 的重定向 URL 配置不正确。

## 配置步骤

### 1. 登录 Supabase Dashboard

访问 [Supabase Dashboard](https://app.supabase.com) 并选择你的项目。

### 2. 配置 Site URL

1. 进入 **Authentication** > **URL Configuration**
2. 设置 **Site URL**：
   - 开发环境：`http://localhost:3000`
   - 生产环境：`https://yourdomain.com`

### 3. 配置 Redirect URLs

在 **Redirect URLs** 中添加以下 URL：

**开发环境：**
```
http://localhost:3000/auth/callback
http://localhost:3000/verify-email
http://localhost:3000
```

**生产环境：**
```
https://yourdomain.com/auth/callback
https://yourdomain.com/verify-email
https://yourdomain.com
```

### 4. 配置邮箱验证重定向

1. 进入 **Authentication** > **Email Templates**
2. 选择 **Confirm signup** 模板
3. 在模板中，确保重定向 URL 设置为：
   ```
   {{ .SiteURL }}/auth/callback
   ```
   或
   ```
   {{ .SiteURL }}/verify-email
   ```

### 5. 保存配置

点击 **Save** 保存所有配置。

## 验证流程说明

### 方式 1：使用 `/auth/callback`（推荐）

1. 用户点击验证邮件中的链接
2. Supabase 重定向到：`http://localhost:3000/auth/callback#access_token=...&refresh_token=...`
3. `pages/auth/callback.tsx` 自动处理验证并设置 session
4. 用户自动登录并跳转到首页

### 方式 2：使用 `/verify-email`

1. 用户点击验证邮件中的链接
2. Supabase 重定向到：`http://localhost:3000/verify-email?token_hash=...&type=email`
3. `pages/verify-email.tsx` 处理验证
4. 验证成功后自动登录

## 测试验证流程

1. **注册新账户**
2. **检查邮箱**，找到验证邮件
3. **点击验证链接**
4. **应该自动跳转**到首页并已登录

## 常见问题

### Q: 点击验证链接后显示"验证失败"

**A:** 检查：
- Redirect URLs 是否包含你的域名
- Site URL 是否正确设置
- 验证链接是否过期（通常 24 小时有效）

### Q: 验证成功但仍然无法登录

**A:** 检查：
- 浏览器控制台是否有错误
- Session 是否正确保存（检查 localStorage）
- AuthContext 是否正常工作

### Q: 验证链接格式不对

**A:** Supabase 的验证链接格式可能是：
- `#access_token=...&refresh_token=...`（Hash 格式）
- `?token_hash=...&type=email`（Query 参数格式）

我们的代码已经处理了这两种格式。

## 调试技巧

1. **检查浏览器控制台**：查看是否有错误信息
2. **检查 Network 标签**：查看 API 请求是否成功
3. **检查 localStorage**：查看是否有 `sb-*-auth-token` 键
4. **检查 Supabase Dashboard**：查看 Authentication > Logs 中的日志

## 快速测试

如果配置正确，验证流程应该是：
1. 注册 → 收到邮件
2. 点击邮件链接 → 自动跳转并登录
3. 无需手动登录


