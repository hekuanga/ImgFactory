# 更新数据库连接字符串

## 当前状态

密码已更新为 `liuhanci2002`，但直接连接仍然失败。

## 问题原因

Supabase 的直接连接默认使用 IPv6。如果您的环境不支持 IPv6，需要使用连接池模式（Supavisor Session Mode）。

## 解决方案：使用连接池模式

### 步骤 1：确定项目区域

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择项目：`fbafdgtmmzoqrgrtdkkl`
3. 进入 **Settings** > **General**
4. 查看 **Region**（区域）信息

### 步骤 2：更新 `.env` 文件

根据您的项目区域，使用以下格式更新连接字符串：

**连接池模式格式：**
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

**常见区域示例：**

#### 如果区域是 `us-east-1`（美国东部）：
```env
DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-0-us-east-1.pooler.supabase.com:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

#### 如果区域是 `us-west-1`（美国西部）：
```env
DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-0-us-west-1.pooler.supabase.com:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

#### 如果区域是 `eu-west-1`（欧洲西部）：
```env
DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
```

#### 如果区域是 `ap-southeast-1`（亚太东南）：
```env
DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### 步骤 3：从 Dashboard 获取（最简单的方法）

**推荐方法：直接从 Supabase Dashboard 复制**

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择项目：`fbafdgtmmzoqrgrtdkkl`
3. 点击页面顶部的 **"Connect"** 按钮
4. 选择 **"Session mode"** 标签
5. 复制连接字符串（格式：`postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-0-[region].pooler.supabase.com:5432/postgres`）
6. 更新 `.env` 文件中的 `DATABASE_URL` 和 `SHADOW_DATABASE_URL`

### 步骤 4：验证连接

更新连接字符串后，运行：

```bash
npx prisma db pull
```

如果成功，您会看到数据库表列表。

然后运行：

```bash
npx prisma db push
```

同步数据库 schema。

## 重要提示

1. **用户名格式**：连接池模式使用 `postgres.fbafdgtmmzoqrgrtdkkl`（不是 `postgres`）
2. **主机格式**：`aws-0-[region].pooler.supabase.com`（不是 `db.fbafdgtmmzoqrgrtdkkl.supabase.co`）
3. **端口**：`5432`（Session mode）或 `6543`（Transaction mode）
4. **密码**：`liuhanci2002`

## 如果仍然失败

1. **检查密码**：确认密码确实是 `liuhanci2002`
2. **检查区域**：确认项目区域是否正确
3. **检查网络**：确保可以访问 Supabase 服务
4. **联系支持**：如果问题持续，检查 Supabase Dashboard 中的项目状态

