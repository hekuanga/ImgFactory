# 数据库设置指南

## 问题
当前 `DATABASE_URL` 配置为 `postgresql://postgres:postgres@db:5432/restorephotos`，其中 `db` 是 Docker Compose 服务名，只在 Docker 网络内有效。

## 解决方案

### 方案 1：使用 Docker 数据库（推荐）

1. **安装 Docker Desktop**（如果未安装）
   - Windows: https://www.docker.com/products/docker-desktop/
   - 安装后重启电脑

2. **启动数据库容器**
   ```bash
   # 只启动数据库服务（不启动应用）
   docker-compose up -d db
   ```

3. **修改 `.env.local` 中的 DATABASE_URL**
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/restorephotos
   SHADOW_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/restorephotos_shadow
   ```
   （注意：使用 `localhost` 而不是 `db`，因为应用在 Docker 外运行）

4. **运行数据库迁移**
   ```bash
   npx prisma migrate dev
   ```

5. **重启开发服务器**
   ```bash
   npm run dev
   ```

### 方案 2：使用本地 PostgreSQL

1. **安装 PostgreSQL**
   - Windows: https://www.postgresql.org/download/windows/
   - 安装时记住设置的密码

2. **创建数据库**
   ```sql
   CREATE DATABASE restorephotos;
   CREATE DATABASE restorephotos_shadow;
   ```

3. **修改 `.env.local`**
   ```env
   DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/restorephotos
   SHADOW_DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/restorephotos_shadow
   ```

4. **运行数据库迁移**
   ```bash
   npx prisma migrate dev
   ```

5. **重启开发服务器**

### 方案 3：使用 Supabase 数据库（如果已配置）

如果你有 Supabase 项目，可以使用 Supabase 的数据库连接字符串：

1. **在 Supabase Dashboard 获取连接字符串**
   - 进入 Supabase Dashboard > Settings > Database
   - 复制 "Connection string" (URI)

2. **修改 `.env.local`**
   ```env
   DATABASE_URL=你的 Supabase 数据库连接字符串
   SHADOW_DATABASE_URL=你的 Supabase 数据库连接字符串（或使用同一个）
   ```

3. **运行数据库迁移**
   ```bash
   npx prisma migrate dev
   ```

## 验证数据库连接

运行以下命令测试连接：
```bash
npx prisma db pull
```

如果成功，说明数据库连接正常。

