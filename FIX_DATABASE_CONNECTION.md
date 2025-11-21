# 修复数据库连接问题

## 问题诊断

当前连接字符串：
```
postgresql://postgres:123456@db.fbafdgtmmzoqrgrtdkkl.supabase.co:5432/postgres
```

错误：`Can't reach database server`

## 可能的原因

1. **IPv6 不支持**：Supabase 的直接连接默认使用 IPv6，如果您的环境不支持 IPv6，连接会失败
2. **密码格式**：Supabase 的密码格式通常是 `[project-ref].[random-string]`，但您说密码是 `123456`
3. **网络问题**：防火墙或网络配置阻止了连接

## 解决方案

### 方案 1：使用 Supavisor Session Mode（推荐，支持 IPv4）

1. **打开 `.env` 文件**

2. **替换连接字符串为连接池模式**：

```env
# 使用 Supavisor Session Mode（支持 IPv4）
DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:123456@aws-0-us-east-1.pooler.supabase.com:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:123456@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**注意**：
- 用户名格式：`postgres.[project-ref]`（不是 `postgres`）
- 主机：`aws-0-[region].pooler.supabase.com`
- 端口：`5432`
- 区域（region）：需要从 Supabase Dashboard 获取，常见的有：
  - `us-east-1`（美国东部）
  - `us-west-1`（美国西部）
  - `eu-west-1`（欧洲西部）
  - `ap-southeast-1`（亚太东南）

### 方案 2：从 Supabase Dashboard 获取正确的连接字符串

1. **访问 Supabase Dashboard**：
   - 登录 [Supabase Dashboard](https://app.supabase.com)
   - 选择项目：`fbafdgtmmzoqrgrtdkkl`

2. **获取连接字符串**：
   - 点击页面顶部的 **"Connect"** 按钮
   - 选择 **"Session mode"** 或 **"Transaction mode"**
   - 复制连接字符串

3. **更新 `.env` 文件**：
   - 将复制的连接字符串粘贴到 `DATABASE_URL` 和 `SHADOW_DATABASE_URL`

### 方案 3：验证密码

如果密码确实是 `123456`，请确认：

1. **在 Supabase Dashboard 中验证**：
   - 进入 **Settings** > **Database**
   - 查看 **Database password** 部分
   - 如果显示 `••••••••`，点击 **Reset database password** 重置

2. **密码格式**：
   - Supabase 的密码通常是 `fbafdgtmmzoqrgrtdkkl.xxxxxxxxxxxxx` 格式
   - 如果您的密码确实是 `123456`，可能需要重置为符合格式的密码

## 验证连接

更新连接字符串后，运行：

```bash
npx prisma db pull
```

如果成功，说明连接正常。

## 如果仍然失败

### 检查 1：网络连接
```bash
# 测试能否访问 Supabase
ping db.fbafdgtmmzoqrgrtdkkl.supabase.co
```

### 检查 2：IPv6 支持
访问 [https://test-ipv6.com](https://test-ipv6.com) 检查您的网络是否支持 IPv6

### 检查 3：防火墙
确保防火墙允许连接到端口 5432

### 检查 4：Supabase 项目状态
在 Supabase Dashboard 中检查项目是否正常运行

## 推荐操作步骤

1. **从 Supabase Dashboard 获取连接字符串**（最可靠的方法）
2. **更新 `.env` 文件**
3. **运行 `npx prisma db pull` 验证连接**
4. **如果成功，运行 `npx prisma db push` 同步 schema**

