# 切换到 Session Mode 连接

## 当前问题

连接字符串已更新为中国香港区域（`ap-east-1`），但仍然出现 "Tenant or user not found" 错误。

## 解决方案

您需要在 Supabase Dashboard 中将连接方式从 "Direct connection" 切换到 "Session mode"（Session Pooler）。

## 操作步骤

### 步骤 1：打开连接设置

1. 在 Supabase Dashboard 中，确保 "Connect to your project" 弹窗已打开
2. 当前显示的是 "Direct connection"

### 步骤 2：切换到 Session Mode

1. **找到 "Method" 下拉框**
   - 在连接字符串配置区域
   - 当前选择是 "Direct connection"

2. **点击 "Method" 下拉框**
   - 选择 **"Session mode"**（或 "Session Pooler"）

3. **或者点击 "Pooler settings" 按钮**
   - 在红色警告框中有 "Pooler settings" 按钮
   - 点击后会显示 Session Pooler 的连接字符串

### 步骤 3：复制连接字符串

切换到 Session mode 后，您会看到新的连接字符串，格式类似：

```
postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-0-[region].pooler.supabase.com:5432/postgres
```

**重要：**
- 用户名格式：`postgres.fbafdgtmmzoqrgrtdkkl`（不是 `postgres`）
- 主机格式：`aws-0-[region].pooler.supabase.com`
- 端口：`5432`（Session mode）或 `6543`（Transaction mode）
- 密码：`liuhanci2002`

### 步骤 4：更新 `.env` 文件

将复制的连接字符串更新到 `.env` 文件：

```env
DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-0-[从Dashboard复制的区域].pooler.supabase.com:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-0-[从Dashboard复制的区域].pooler.supabase.com:5432/postgres
```

### 步骤 5：验证连接

更新后，运行：

```bash
npx prisma db pull
```

如果成功，您会看到数据库表列表。

## 为什么需要 Session Mode？

- **Direct connection**：需要 IPv6 支持，您的环境可能不支持
- **Session mode**：支持 IPv4，适合大多数环境
- **Transaction mode**：适合无服务器函数，端口是 6543

## 如果找不到 Session Mode 选项

### 方法 1：查看其他标签页

在 "Connect to your project" 弹窗中，查看其他标签页：
- **ORMs** 标签页
- **App Frameworks** 标签页

这些标签页可能会显示不同格式的连接字符串。

### 方法 2：手动构建连接字符串

如果您知道确切的区域代码，可以手动构建：

```env
# 中国香港区域（如果区域代码是 ap-east-1）
DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-0-ap-east-1.pooler.supabase.com:5432/postgres

# 或者尝试其他亚太区域
# ap-southeast-1 (新加坡)
DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

# ap-northeast-1 (东京)
DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
```

## 验证步骤

1. 更新连接字符串
2. 运行 `npx prisma db pull`
3. 如果成功，运行 `npx prisma db push` 同步 schema
4. 运行 `npx prisma generate` 生成 Prisma Client

## 常见问题

### Q: 为什么还是 "Tenant or user not found"？

A: 可能的原因：
1. 区域代码不正确
2. 用户名格式不正确（应该是 `postgres.fbafdgtmmzoqrgrtdkkl`）
3. 密码不正确

### Q: 如何确认区域代码？

A: 在 Supabase Dashboard 中：
1. 进入 **Settings** > **General**
2. 查看 **Region** 信息
3. 或者在连接字符串中查看主机名

### Q: Session mode 和 Transaction mode 的区别？

A:
- **Session mode**：端口 5432，适合持久连接
- **Transaction mode**：端口 6543，适合无服务器函数

对于 Prisma，通常使用 **Session mode**。

