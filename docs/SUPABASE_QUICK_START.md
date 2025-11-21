# Supabase 快速接入指南

本文档提供 Supabase 的快速接入步骤，适合快速参考。

---

## 🚀 5 分钟快速接入

### 步骤 1：创建项目（2 分钟）

1. 访问 [https://supabase.com](https://supabase.com)
2. 注册/登录账号
3. 点击 "New Project"
4. 填写项目信息：
   - Name: 项目名称
   - Database Password: **设置并保存密码**
   - Region: 选择区域
5. 等待项目创建完成

### 步骤 2：获取 API 密钥（1 分钟）

1. 进入 **Settings** > **API**
2. 复制以下密钥：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 步骤 3：获取数据库连接字符串（1 分钟）

1. 点击页面顶部的 **"Connect"** 按钮
2. 选择 **"Session mode"** 标签
3. 复制连接字符串
4. 格式：`postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`

### 步骤 4：配置环境变量（1 分钟）

在 `.env.local` 文件中添加：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

### 步骤 5：安装依赖并测试

```bash
npm install @supabase/supabase-js
npm run dev
```

---

## 📋 关键配置项清单

### 必需配置
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - 项目 URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 匿名密钥
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - 服务角色密钥
- [ ] `DATABASE_URL` - 数据库连接字符串（连接池模式）

### 可选配置
- [ ] Authentication > Settings > Email confirmations（开发环境建议禁用）
- [ ] Authentication > URL Configuration > Site URL
- [ ] Authentication > URL Configuration > Redirect URLs

---

## 🔍 常见问题快速解决

### 问题：注册后无法登录

**解决：** 在 Supabase Dashboard > Authentication > Settings 中禁用 "Enable email confirmations"

### 问题：数据库连接失败

**解决：** 
1. 使用连接池模式（Session mode）
2. 检查连接字符串格式
3. 验证密码是否正确

---

## 📖 详细文档

完整详细教程请参考：[INTEGRATION_TUTORIAL.md](./INTEGRATION_TUTORIAL.md)

