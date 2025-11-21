# 快速修复数据库连接

## 问题
`.env` 文件中仍然包含 `[YOUR_PASSWORD]` 占位符，需要替换为实际密码。

## 解决步骤

### 步骤 1：打开 `.env` 文件

在项目根目录找到 `.env` 文件并打开。

### 步骤 2：找到这两行

```env
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.fbafdgtmmzoqrgrtdkkl.supabase.co:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.fbafdgtmmzoqrgrtdkkl.supabase.co:5432/postgres
```

### 步骤 3：获取数据库密码

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择项目：`fbafdgtmmzoqrgrtdkkl`
3. 进入 **Settings** > **Database**
4. 在 **Database password** 部分：
   - 如果显示密码，直接复制
   - 如果显示 `••••••••`，点击 **Reset database password** 重置

### 步骤 4：替换密码

将 `.env` 文件中的 `[YOUR_PASSWORD]` 替换为实际密码。

**替换前：**
```env
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.fbafdgtmmzoqrgrtdkkl.supabase.co:5432/postgres
```

**替换后（示例）：**
```env
DATABASE_URL=postgresql://postgres:fbafdgtmmzoqrgrtdkkl.A1B2C3D4E5F6G7H8@db.fbafdgtmmzoqrgrtdkkl.supabase.co:5432/postgres
```

**重要：**
- 两处 `[YOUR_PASSWORD]` 都要替换
- 密码前后不要有空格
- 保存文件

### 步骤 5：验证连接

```bash
npx prisma db pull
```

如果成功，说明连接正常。

### 步骤 6：同步数据库 Schema

```bash
npx prisma db push
```

## 如果仍然失败

### 检查 1：密码格式
- 确保密码没有多余的空格
- 确保密码是完整的（包含项目 ref 和随机字符串）

### 检查 2：网络连接
- 确保可以访问 Supabase（检查防火墙）

### 检查 3：数据库状态
- 在 Supabase Dashboard 中检查数据库是否正常运行

### 检查 4：连接字符串格式
确保格式正确：
```
postgresql://postgres:密码@db.fbafdgtmmzoqrgrtdkkl.supabase.co:5432/postgres
```

## 示例完整配置

```env
DATABASE_URL=postgresql://postgres:fbafdgtmmzoqrgrtdkkl.你的实际密码@db.fbafdgtmmzoqrgrtdkkl.supabase.co:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres:fbafdgtmmzoqrgrtdkkl.你的实际密码@db.fbafdgtmmzoqrgrtdkkl.supabase.co:5432/postgres
```

