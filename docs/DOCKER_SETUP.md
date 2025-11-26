# Docker 配置和使用指南

本文档说明如何使用 Docker 部署应用。

---

## 📋 目录

1. [前置要求](#前置要求)
2. [快速开始](#快速开始)
3. [环境变量配置](#环境变量配置)
4. [构建和运行](#构建和运行)
5. [健康检查](#健康检查)
6. [常见问题](#常见问题)

---

## 🔧 前置要求

### 必需软件

1. **Docker**
   - 版本：20.10 或更高
   - 安装：https://docs.docker.com/get-docker/

2. **Docker Compose**
   - 版本：1.29 或更高
   - 通常随 Docker Desktop 一起安装

### 验证安装

```bash
docker --version
docker-compose --version
```

---

## 🚀 快速开始

### 步骤 1：配置环境变量

1. **复制环境变量模板**
   ```bash
   cp docker.env.example .env
   ```

2. **编辑 `.env` 文件**
   - 填写所有必需的环境变量
   - 参考 [环境变量配置](#环境变量配置) 部分

### 步骤 2：构建和启动

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f app
```

### 步骤 3：访问应用

- 应用地址：http://localhost:3000
- 健康检查：http://localhost:3000/api/health

---

## 📝 环境变量配置

### 必需环境变量

#### Supabase 配置
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

#### Stripe 配置
```env
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_BASIC=price_xxxxx
STRIPE_PRICE_VIP=price_xxxxx
```

#### API 密钥
```env
REPLICATE_API_KEY=r8_xxxxx
ARK_API_KEY=your_ark_api_key
```

### 可选环境变量

```env
APP_PORT=3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_UPLOAD_API_KEY=free
```

### 环境变量优先级

Docker Compose 按以下顺序加载环境变量：

1. `.env` 文件（项目根目录）
2. `docker-compose.yml` 中的 `environment` 部分
3. 系统环境变量

**推荐：** 使用 `.env` 文件管理所有环境变量。

---

## 🏗️ 构建和运行

### 构建镜像

```bash
# 构建（不使用缓存）
docker-compose build --no-cache

# 构建（使用缓存，更快）
docker-compose build
```

### 启动服务

```bash
# 后台启动
docker-compose up -d

# 前台启动（查看日志）
docker-compose up
```

### 停止服务

```bash
# 停止服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止并删除容器、卷、网络
docker-compose down -v
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs

# 查看应用日志
docker-compose logs app

# 实时查看日志
docker-compose logs -f app

# 查看最近 100 行日志
docker-compose logs --tail=100 app
```

### 重启服务

```bash
# 重启服务
docker-compose restart

# 重启特定服务
docker-compose restart app
```

---

## 🔍 健康检查

### 健康检查端点

应用提供了健康检查端点：`/api/health`

**访问：**
```bash
curl http://localhost:3000/api/health
```

**响应示例：**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "checks": {
    "database": "ok",
    "supabase": "ok"
  }
}
```

### Docker 健康检查

Docker Compose 配置了自动健康检查：

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s
```

**查看健康状态：**
```bash
docker-compose ps
```

---

## 🛠️ 常用命令

### 进入容器

```bash
# 进入运行中的容器
docker-compose exec app sh

# 以 root 用户进入
docker-compose exec -u root app sh
```

### 执行命令

```bash
# 在容器中执行命令
docker-compose exec app npm run prisma:generate
docker-compose exec app npx prisma db push
```

### 查看资源使用

```bash
# 查看容器资源使用
docker stats

# 查看特定容器
docker stats restorephotos_app_1
```

### 清理

```bash
# 清理未使用的镜像
docker image prune

# 清理所有未使用的资源
docker system prune -a

# 清理卷（谨慎使用）
docker volume prune
```

---

## ❓ 常见问题

### Q1: 构建失败，提示找不到环境变量

**原因：** 构建时某些环境变量未设置。

**解决方案：**
1. 确保 `.env` 文件存在且包含所有必需变量
2. 检查 `docker-compose.yml` 中的环境变量配置
3. 构建时可以通过 `--build-arg` 传递变量：
   ```bash
   docker-compose build --build-arg DATABASE_URL=your_url
   ```

### Q2: 应用启动后无法连接数据库

**原因：** 
- DATABASE_URL 配置错误
- Supabase 连接池限制
- 网络问题

**解决方案：**
1. 检查 `DATABASE_URL` 格式是否正确
2. 确认使用连接池模式（`pooler.supabase.com`）
3. 检查 Supabase Dashboard 中的连接限制
4. 查看应用日志：`docker-compose logs app`

### Q3: Prisma Client 未生成

**原因：** 构建时 Prisma Client 生成失败。

**解决方案：**
1. 进入容器手动生成：
   ```bash
   docker-compose exec app npx prisma generate
   ```
2. 重启容器：
   ```bash
   docker-compose restart app
   ```

### Q4: 端口已被占用

**原因：** 端口 3000 已被其他应用使用。

**解决方案：**
1. 修改 `docker-compose.yml` 中的端口映射：
   ```yaml
   ports:
     - "3001:3000"  # 使用 3001 端口
   ```
2. 或停止占用端口的应用

### Q5: 容器频繁重启

**原因：** 应用启动失败或健康检查失败。

**解决方案：**
1. 查看日志找出错误：
   ```bash
   docker-compose logs app
   ```
2. 检查环境变量是否正确
3. 检查数据库连接是否正常
4. 检查健康检查端点是否可访问

### Q6: 如何更新应用代码

**解决方案：**
```bash
# 1. 停止服务
docker-compose down

# 2. 重新构建（包含最新代码）
docker-compose build --no-cache

# 3. 启动服务
docker-compose up -d
```

### Q7: 如何查看容器内部文件

```bash
# 进入容器
docker-compose exec app sh

# 查看文件
ls -la
cat package.json
```

---

## 📚 相关文档

- [Supabase 接入教程](./INTEGRATION_TUTORIAL.md)
- [Stripe 接入教程](./INTEGRATION_TUTORIAL.md)
- [环境变量配置指南](./ENVIRONMENT_VARIABLES_GUIDE.md)

---

## 🔒 安全建议

1. **不要提交 `.env` 文件**
   - `.env` 已在 `.gitignore` 中
   - 使用 `docker.env.example` 作为模板

2. **生产环境配置**
   - 使用 Docker Secrets 或环境变量注入
   - 不要在镜像中硬编码敏感信息

3. **网络安全**
   - 使用 Docker 网络隔离服务
   - 不要暴露不必要的端口

4. **资源限制**
   - 已配置 CPU 和内存限制
   - 根据实际需求调整

---

## ✅ 检查清单

部署前请确认：

- [ ] Docker 和 Docker Compose 已安装
- [ ] `.env` 文件已创建并配置
- [ ] 所有必需的环境变量已设置
- [ ] 数据库连接字符串正确（Supabase 连接池模式）
- [ ] Stripe 和 Supabase API 密钥有效
- [ ] 端口 3000 未被占用
- [ ] 有足够的磁盘空间（至少 2GB）

---

**完成配置后，您的应用将在 Docker 容器中运行！** 🎉



