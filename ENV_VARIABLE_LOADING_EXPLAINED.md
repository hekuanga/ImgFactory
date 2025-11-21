# 环境变量加载机制详解

## 为什么会出现混乱？

这是因为 **Next.js** 和 **Prisma** 的环境变量加载机制不同。

## Next.js 的环境变量加载顺序

Next.js 按以下顺序加载环境变量（**后面的会覆盖前面的**）：

1. `.env` - 所有环境共享
2. `.env.local` - 本地开发（**最高优先级**，会覆盖 `.env`）
3. `.env.development` - 开发环境
4. `.env.development.local` - 开发环境本地覆盖

**重要：** `.env.local` 的优先级最高，会覆盖 `.env` 中的同名变量。

## Prisma 的环境变量加载

Prisma 有两个不同的使用场景：

### 1. Prisma CLI（命令行工具）

当运行 `npx prisma db push`、`npx prisma generate` 等命令时：
- 直接读取 `.env` 文件
- **可能不会读取 `.env.local`**（取决于 Prisma 版本）

### 2. Prisma Client（运行时）

当代码中执行 `new PrismaClient()` 时：
- 读取 Node.js 进程的环境变量
- 这些变量由 **Next.js 加载**（所以会遵循 Next.js 的优先级）

## 问题根源

这就是为什么会出现混乱：

1. **Prisma CLI** 可能读取 `.env` 文件（错误的配置）
2. **Prisma Client 运行时** 读取 Next.js 加载的环境变量（可能是 `.env.local`）
3. 如果 `.env.local` 不存在，Next.js 会使用 `.env` 文件

## 正确的解决方案

### 方案 1：只使用 `.env.local`（推荐）

**适用于：** 本地开发环境

1. **创建 `.env.local` 文件**（如果不存在）
2. **将所有配置放在 `.env.local` 中**
3. **`.env` 文件可以保留**（用于其他用途或作为模板）

**优点：**
- `.env.local` 不会被 Git 跟踪（更安全）
- Next.js 优先读取 `.env.local`
- Prisma Client 运行时使用正确的配置

**缺点：**
- Prisma CLI 可能读取 `.env`（如果 `.env.local` 不存在）

### 方案 2：同时更新两个文件（保险）

**适用于：** 确保所有工具都能正确读取

1. **更新 `.env.local` 文件**（Next.js 和 Prisma Client 运行时使用）
2. **同时更新 `.env` 文件**（Prisma CLI 可能使用）

**优点：**
- 确保所有工具都能正确读取
- 不会出现配置不一致的问题

**缺点：**
- 需要维护两个文件
- `.env` 文件可能被 Git 跟踪（不安全）

## 当前项目的推荐做法

### 步骤 1：优先使用 `.env.local`

在 `.env.local` 文件中配置所有环境变量：

```env
# Database (连接池模式)
DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

# Stripe
STRIPE_PRICE_BASIC=price_1SUPEqE6jQ7bhHk5Fo2FhDL
# ... 其他配置
```

### 步骤 2：确保 `.env` 文件也正确（可选但推荐）

如果 `.env` 文件存在，也更新它，以防 Prisma CLI 读取：

```env
DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

### 步骤 3：验证配置

访问测试 API 查看实际加载的配置：
```
http://localhost:3000/api/test-db-env
```

## 总结

| 工具/场景 | 读取的文件 | 优先级 |
|---------|----------|--------|
| Next.js 运行时 | `.env.local` > `.env` | `.env.local` 优先 |
| Prisma Client 运行时 | Next.js 加载的环境变量 | 遵循 Next.js 优先级 |
| Prisma CLI | `.env`（可能不读 `.env.local`） | `.env` |

**最佳实践：**
1. **主要使用 `.env.local`**（Next.js 优先读取）
2. **同时更新 `.env`**（确保 Prisma CLI 也能读取）
3. **将 `.env.local` 添加到 `.gitignore`**（不提交到 Git）

## 当前问题的解决方案

1. **创建或更新 `.env.local` 文件**，包含正确的连接池配置
2. **同时更新 `.env` 文件**，确保 Prisma CLI 也能读取
3. **完全重启开发服务器**
4. **验证配置**：访问 `http://localhost:3000/api/test-db-env`

这样就能确保所有工具都使用正确的配置了！

