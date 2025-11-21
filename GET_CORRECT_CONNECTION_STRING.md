# 获取正确的数据库连接字符串

## 当前状态

✅ 密码已更新为 `liuhanci2002`  
✅ 已切换到连接池模式（支持 IPv4）  
❌ 错误：`FATAL: Tenant or user not found`

## 问题分析

错误 "Tenant or user not found" 通常意味着：
- 用户名格式不正确
- 区域（region）不正确
- 需要从 Supabase Dashboard 获取确切的连接字符串

## 解决方案：从 Supabase Dashboard 获取

### 步骤 1：访问 Supabase Dashboard

1. 打开浏览器，访问 [Supabase Dashboard](https://app.supabase.com)
2. 登录您的账号
3. 选择项目：`fbafdgtmmzoqrgrtdkkl`

### 步骤 2：获取连接字符串

1. **点击页面顶部的 "Connect" 按钮**
   - 通常在项目名称旁边，或者页面顶部导航栏

2. **选择 "Session mode" 标签**
   - 这会显示支持 IPv4 的连接池模式连接字符串

3. **复制连接字符串**
   - 格式应该类似：`postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-0-[region].pooler.supabase.com:5432/postgres`
   - 注意：用户名是 `postgres.fbafdgtmmzoqrgrtdkkl`（不是 `postgres`）

### 步骤 3：更新 `.env` 文件

打开项目根目录的 `.env` 文件，将 `DATABASE_URL` 和 `SHADOW_DATABASE_URL` 更新为您从 Dashboard 复制的连接字符串。

**示例格式：**
```env
DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-0-[您的区域].pooler.supabase.com:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres.fbafdgtmmzoqrgrtdkkl:liuhanci2002@aws-0-[您的区域].pooler.supabase.com:5432/postgres
```

### 步骤 4：验证连接

更新后，运行：

```bash
npx prisma db pull
```

如果成功，您会看到数据库表列表。

然后运行：

```bash
npx prisma db push
```

同步数据库 schema。

## 如果找不到 "Connect" 按钮

### 方法 2：从 Settings > Database 获取

1. 进入 **Settings** > **Database**
2. 找到 **Connection string** 部分
3. 选择 **URI** 标签
4. 选择 **Session mode**（不是 Direct connection）
5. 复制连接字符串

## 常见区域

如果 Dashboard 中显示的区域是：
- **US East (N. Virginia)** → `us-east-1`
- **US West (Oregon)** → `us-west-1`
- **EU West (Ireland)** → `eu-west-1`
- **Asia Pacific (Singapore)** → `ap-southeast-1`
- **Asia Pacific (Tokyo)** → `ap-northeast-1`

## 重要提示

1. **使用 Session mode**：确保选择的是 Session mode，不是 Direct connection
2. **用户名格式**：连接池模式使用 `postgres.[project-ref]` 格式
3. **密码**：确保密码是 `liuhanci2002`
4. **保存文件**：更新后记得保存 `.env` 文件

## 验证步骤

更新连接字符串后，运行以下命令验证：

```bash
# 1. 测试连接
npx prisma db pull

# 2. 如果成功，同步 schema
npx prisma db push

# 3. 生成 Prisma Client
npx prisma generate
```

如果所有命令都成功，说明数据库连接配置正确！

