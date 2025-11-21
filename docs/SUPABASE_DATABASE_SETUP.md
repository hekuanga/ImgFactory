# Supabase 数据库配置指南

## 为什么使用 Supabase 数据库？

既然你已经在使用 Supabase 进行登录认证，使用 Supabase 的数据库有以下优势：

1. ✅ **统一管理**：认证和业务数据都在同一个数据库中
2. ✅ **无需额外配置**：不需要维护本地 PostgreSQL 或 Docker 容器
3. ✅ **云端托管**：自动备份、高可用性
4. ✅ **免费额度**：Supabase 免费计划提供 500MB 数据库空间

## 获取 Supabase 数据库连接字符串

### 步骤 1：登录 Supabase Dashboard

访问 [Supabase Dashboard](https://app.supabase.com) 并选择你的项目。

### 步骤 2：获取数据库连接字符串

1. 进入 **Settings** > **Database**
2. 找到 **Connection string** 部分
3. 选择 **URI** 标签
4. 复制连接字符串（格式类似：`postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`）

**重要提示：**
- 使用 **Connection pooling** 模式（端口 6543）用于应用连接
- 使用 **Direct connection** 模式（端口 5432）用于 Prisma migrations
- 密码可以在 **Database** > **Database password** 中重置或查看

### 步骤 3：配置环境变量

更新 `.env.local` 文件：

```env
# Supabase 数据库连接（用于 Prisma）
# 使用 Direct connection（端口 5432）用于 migrations
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres

# Shadow database（用于 Prisma migrations，可以使用同一个数据库）
SHADOW_DATABASE_URL=postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
```

**示例：**
```env
DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:your_password@db.fbafdgtmmzoqrgrtdkkl.supabase.co:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:your_password@db.fbafdgtmmzoqrgrtdkkl.supabase.co:5432/postgres
```

## 数据库架构说明

### Supabase 已有的表

Supabase 自动创建了以下表（在 `auth` schema 中）：
- `auth.users` - 用户认证信息（由 Supabase Auth 管理）
- `auth.sessions` - 用户会话信息

### Prisma 需要创建的表

Prisma 会在 `public` schema 中创建以下表：
- `users` - 业务用户数据（包含 Stripe 订阅信息）
- `image_processing_history` - 图片处理历史
- `usage_limits` - 使用限制

### 表关联

- `public.users.id` 应该与 `auth.users.id` 保持一致（使用相同的 UUID）
- 当用户通过 Supabase Auth 注册时，需要在 `public.users` 表中创建对应记录

## 同步 Prisma Schema 到 Supabase

### 步骤 1：运行数据库迁移

```bash
# 推送 schema 到 Supabase 数据库
npx prisma db push

# 或者使用 migrations（推荐用于生产环境）
npx prisma migrate dev --name init
```

### 步骤 2：验证表已创建

在 Supabase Dashboard 中：
1. 进入 **Table Editor**
2. 应该能看到以下表：
   - `users`
   - `image_processing_history`
   - `usage_limits`

## 同步用户数据

当用户通过 Supabase Auth 注册时，需要在 `public.users` 表中创建对应记录。

### 方法 1：使用 Supabase Database Webhook（推荐）

在 Supabase Dashboard 中配置 Database Webhook：
1. 进入 **Database** > **Webhooks**
2. 创建新的 Webhook
3. 监听 `auth.users` 表的 `INSERT` 事件
4. 在 Webhook 中创建对应的 `public.users` 记录

### 方法 2：在注册 API 中创建（当前实现）

在 `pages/api/auth/register.ts` 中，注册成功后创建 `public.users` 记录。

## 注意事项

1. **数据库密码**：如果忘记了数据库密码，可以在 Supabase Dashboard 中重置
2. **连接池限制**：Supabase 免费计划有连接数限制，使用连接池模式（端口 6543）可以更好地处理并发
3. **RLS（Row Level Security）**：Supabase 默认启用 RLS，确保配置正确的安全策略
4. **Prisma 和 Supabase 客户端**：
   - 使用 Prisma 访问 `public` schema 中的业务表
   - 使用 Supabase 客户端访问 `auth` schema 中的认证表

## 验证配置

运行以下命令测试数据库连接：

```bash
# 测试 Prisma 连接
npx prisma db pull

# 如果成功，说明连接正常
```

## 常见问题

### Q: 如何重置数据库密码？

**A:** 
1. 进入 Supabase Dashboard > Settings > Database
2. 点击 **Reset database password**
3. 复制新密码并更新 `.env.local`

### Q: 连接字符串中的密码在哪里？

**A:** 
- 如果是新项目，密码在项目创建时设置
- 如果忘记了，可以在 Dashboard 中重置
- 密码格式：`[project-ref].[random-string]`

### Q: 应该使用哪个端口？

**A:**
- **5432**（Direct connection）：用于 Prisma migrations 和开发
- **6543**（Connection pooling）：用于生产环境应用连接（更好的性能）

### Q: Prisma 和 Supabase 客户端如何配合使用？

**A:**
- **Supabase Auth**：处理用户认证（登录、注册、会话管理）
- **Prisma**：访问业务数据（订阅信息、处理历史等）
- 两者通过 `user.id` 关联

