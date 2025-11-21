# Supabase 配置指南

## 邮箱验证设置

### 开发环境（禁用邮箱验证）

如果希望在开发环境中注册后立即登录，可以在 Supabase Dashboard 中禁用邮箱验证：

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Authentication** > **Settings**
4. 找到 **Email Auth** 部分
5. 取消勾选 **"Enable email confirmations"**（禁用邮箱确认）
6. 保存设置

### 生产环境（启用邮箱验证）

生产环境建议启用邮箱验证以确保账户安全：

1. 在 Supabase Dashboard 中启用 **"Enable email confirmations"**
2. 配置邮箱模板（可选）
3. 设置邮箱重定向 URL

## 环境变量配置

确保 `.env.local` 文件包含以下变量：

```env
# Supabase Auth 配置（从 Settings > API 获取）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Supabase 数据库配置（从 Settings > Database 获取）
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
```

### 获取数据库连接字符串

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Settings** > **Database**
4. 找到 **Connection string** 部分
5. 选择 **URI** 标签
6. 复制连接字符串（使用 **Direct connection**，端口 5432）
7. 如果忘记了密码，点击 **Reset database password** 重置

**连接字符串格式：**
```
postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
```

**示例：**
```
postgresql://postgres.fbafdgtmmzoqrgrtdkkl:your_password@db.fbafdgtmmzoqrgrtdkkl.supabase.co:5432/postgres
```

详细说明请参考：[Supabase 数据库配置指南](./SUPABASE_DATABASE_SETUP.md)

## 常见问题

### 1. 注册后无法登录（Invalid login credentials）

**原因：** Supabase 启用了邮箱验证，注册后需要先验证邮箱才能登录。

**解决方案：**
- **开发环境：** 在 Supabase Dashboard 中禁用邮箱验证
- **生产环境：** 检查邮箱收件箱，点击验证链接

### 2. 邮箱验证邮件未收到

**检查：**
- 检查垃圾邮件文件夹
- 确认 Supabase 项目中的邮箱配置正确
- 检查 Supabase Dashboard 中的邮件发送日志

### 3. Session 未持久化

**原因：** Supabase 客户端配置问题。

**解决方案：** 确保 `lib/supabaseClient.ts` 中配置了：
```typescript
{
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}
```

## 测试账户

开发环境可以创建测试账户：
1. 注册时使用真实邮箱（如果禁用验证）或测试邮箱
2. 如果启用验证，检查 Supabase Dashboard 中的邮件日志获取验证链接

