# 紧急修复数据库连接问题

## 问题

Prisma 仍然使用直接连接模式（`db.fbafdgtmmzoqrgrtdkkl.supabase.co:5432`），而不是连接池模式。

## 根本原因

Prisma 可能优先读取 `.env` 文件，而不是 `.env.local` 文件。需要同时更新两个文件。

## 立即修复步骤

### 步骤 1：更新 `.env` 文件

打开项目根目录的 `.env` 文件，找到 `DATABASE_URL` 和 `SHADOW_DATABASE_URL`，更新为：

```env
DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

### 步骤 2：创建或更新 `.env.local` 文件

确保 `.env.local` 文件（注意前面的点）包含相同的配置：

```env
DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

### 步骤 3：验证配置

访问测试 API 查看实际加载的配置：
```
http://localhost:3000/api/test-db-env
```

应该看到：
```json
{
  "success": true,
  "databaseHost": "aws-1-ap-south-1.pooler.supabase.com",
  "isPoolerMode": true
}
```

### 步骤 4：完全重启开发服务器

**重要：** 必须完全重启：

1. **停止服务器**：按 `Ctrl+C`（可能需要按两次）
2. **等待完全停止**：确保进程完全退出
3. **重新启动**：
   ```bash
   npm run dev
   ```

### 步骤 5：验证修复

重启后，错误应该消失。如果仍然失败：

1. 检查服务器终端输出
2. 访问 `http://localhost:3000/api/test-db-env` 确认配置
3. 确认使用的是连接池模式（`aws-1-ap-south-1.pooler.supabase.com`）

## 关键配置对比

### ❌ 错误配置（直接连接）
```
DATABASE_URL=postgresql://postgres:password@db.fbafdgtmmzoqrgrtdkkl.supabase.co:5432/postgres
```

### ✅ 正确配置（连接池模式）
```
DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

**区别：**
- 主机：`aws-1-ap-south-1.pooler.supabase.com`（不是 `db.fbafdgtmmzoqrgrtdkkl.supabase.co`）
- 用户名：`postgres.fbafdgtmmzoqrgrtdkkl`（不是 `postgres`）

## 如果仍然失败

1. **检查两个文件**：确保 `.env` 和 `.env.local` 都包含正确的配置
2. **删除 Prisma Client 缓存**：
   ```bash
   rm -rf node_modules/.prisma
   npx prisma generate
   ```
3. **检查环境变量**：访问 `http://localhost:3000/api/test-db-env` 查看实际加载的值

