# 如何获取 Supabase 数据库密码

## 方法 1：在 Dashboard 中查看（如果已设置）

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目：`fbafdgtmmzoqrgrtdkkl`
3. 进入 **Settings** > **Database**
4. 在 **Database password** 部分查看密码
5. 如果显示为 `••••••••`，说明密码已隐藏，需要使用方法 2 重置

## 方法 2：重置数据库密码（推荐）

如果忘记了密码或密码不可见，可以重置：

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目：`fbafdgtmmzoqrgrtdkkl`
3. 进入 **Settings** > **Database**
4. 找到 **Database password** 部分
5. 点击 **Reset database password** 按钮
6. 复制生成的新密码（格式类似：`fbafdgtmmzoqrgrtdkkl.xxxxxxxxxxxxx`）
7. **重要**：立即更新 `.env.local` 文件中的密码

## 密码格式

Supabase 数据库密码格式通常是：
```
[project-ref].[随机字符串]
```

例如：
```
fbafdgtmmzoqrgrtdkkl.A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6
```

## 更新 .env.local

获取密码后，更新 `.env.local` 文件：

```env
# 将 [YOUR_PASSWORD] 替换为实际密码
DATABASE_URL=postgresql://postgres:fbafdgtmmzoqrgrtdkkl.你的实际密码@db.fbafdgtmmzoqrgrtdkkl.supabase.co:5432/postgres
SHADOW_DATABASE_URL=postgresql://postgres:fbafdgtmmzoqrgrtdkkl.你的实际密码@db.fbafdgtmmzoqrgrtdkkl.supabase.co:5432/postgres
```

**注意：**
- 密码中可能包含特殊字符，不需要 URL 编码
- 直接替换 `[YOUR_PASSWORD]` 即可
- 确保密码前后没有空格

## 验证连接

更新密码后，运行以下命令验证连接：

```bash
# 测试 Prisma 连接
npx prisma db pull

# 如果成功，说明密码正确
```

## 常见问题

### Q: 密码中包含特殊字符怎么办？

**A:** 直接使用即可，Supabase 的连接字符串已经处理了特殊字符。

### Q: 重置密码后，现有连接会断开吗？

**A:** 是的，重置密码后需要更新所有使用旧密码的连接字符串。

### Q: 可以在多个地方使用同一个密码吗？

**A:** 是的，同一个 Supabase 项目的所有连接都使用相同的数据库密码。

