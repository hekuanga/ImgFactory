# 积分显示问题诊断指南

## 问题描述

数据库中显示的用户积分为2，但是前端显示为0。

## 可能的原因

1. **用户ID不匹配**
   - Supabase 用户 ID 和数据库中的用户 ID 不一致
   - 可能是 UUID 格式问题或字符串转换问题

2. **查询条件错误**
   - 查询时使用的用户 ID 不正确
   - 数据库查询条件有问题

3. **数据同步问题**
   - 注册时用户记录创建失败
   - 积分更新没有正确保存

4. **缓存问题**
   - 前端缓存了旧的积分值
   - API 返回了缓存的数据

## 诊断步骤

### 1. 检查服务器日志

查看服务器日志（终端或 Vercel 日志），查找以下日志：

```
[CreditsBalance] User authenticated: id=xxx, email=xxx
[CreditsBalance] Querying credits for userId: xxx, email: xxx
[CreditsBalance] User record found: credits=2
[CreditsBalance] Returning credits: 2 for userId: xxx
```

或者：

```
[CreditsBalance] User record found: not found
[CreditsBalance] WARNING: User ID mismatch! Supabase ID: xxx, DB ID: xxx
```

### 2. 检查浏览器控制台

打开浏览器开发者工具（F12），查看 Console 标签：

```
[Header] Loading credits for user: xxx, xxx@example.com
[Header] Credits API response: {success: true, credits: 0}
[Header] Setting credits to: 0
```

### 3. 检查数据库

直接查询数据库，确认：
- 用户记录是否存在
- 用户的 `id` 字段值
- 用户的 `credits` 字段值
- 用户的 `email` 字段值

SQL 查询示例：
```sql
SELECT id, email, credits FROM users WHERE email = 'your-email@example.com';
```

### 4. 检查用户ID匹配

比较以下ID是否一致：
- Supabase 用户 ID（从 `user.id` 获取）
- 数据库中的用户 ID（从数据库查询获取）

如果ID不一致，说明用户记录创建时使用了错误的ID。

## 解决方案

### 方案1：用户ID不匹配

如果日志显示 "User ID mismatch"，说明 Supabase 用户 ID 和数据库用户 ID 不一致。

**修复方法：**
1. 检查注册API中的用户ID使用
2. 确保注册时使用 Supabase 返回的 `user.id`
3. 确保所有API都使用相同的用户ID格式

### 方案2：用户记录不存在

如果日志显示 "User record found: not found"，说明数据库中没有该用户的记录。

**修复方法：**
1. 检查注册API是否成功创建用户记录
2. 查看注册API的日志，确认用户是否创建成功
3. 如果用户记录不存在，登录API会自动创建（但积分为0）

### 方案3：查询条件错误

如果用户记录存在但查询不到，可能是查询条件有问题。

**修复方法：**
1. 检查 Prisma schema 中的 `id` 字段类型
2. 确保查询时用户ID格式正确（字符串）
3. 使用邮箱作为备用查询条件（已实现）

### 方案4：数据同步延迟

如果注册后立即查询积分，可能存在数据同步延迟。

**修复方法：**
1. 等待几秒后刷新页面
2. 检查数据库事务是否成功提交
3. 查看注册API的日志，确认积分是否成功添加

## 代码改进

已添加以下改进：

1. **详细的日志记录**
   - 记录用户认证信息
   - 记录数据库查询结果
   - 记录返回的积分值

2. **邮箱备用查询**
   - 如果通过ID查询不到用户，尝试通过邮箱查询
   - 如果找到用户但ID不匹配，记录警告并返回该用户的积分

3. **前端日志**
   - 记录API请求和响应
   - 记录积分设置过程

## 测试步骤

1. **注册新用户**
   - 注册一个新账户
   - 查看服务器日志，确认积分是否成功添加

2. **检查积分显示**
   - 登录后查看Header中的积分显示
   - 检查浏览器控制台的日志
   - 检查服务器日志

3. **验证数据库**
   - 直接查询数据库，确认积分值
   - 比较数据库中的用户ID和Supabase用户ID

4. **检查日志**
   - 查看所有 `[CreditsBalance]` 和 `[Header]` 日志
   - 确认每个步骤的值是否正确

## 常见问题

### Q1: 日志显示用户记录不存在

**A:** 检查：
- 注册API是否成功执行
- 数据库连接是否正常
- 用户记录是否真的创建成功

### Q2: 日志显示用户ID不匹配

**A:** 检查：
- 注册时使用的用户ID是否正确
- Supabase 返回的用户ID格式
- 数据库中的用户ID格式

### Q3: 数据库有积分但API返回0

**A:** 检查：
- 查询条件是否正确
- 用户ID是否匹配
- 数据库字段名是否正确（`credits`）

### Q4: 前端显示0但API返回2

**A:** 检查：
- 前端是否正确解析API响应
- 是否有缓存问题
- 浏览器控制台是否有错误

## 联系支持

如果按照上述步骤仍然无法解决问题，请提供：
- 服务器日志（包含所有 `[CreditsBalance]` 和 `[Register]` 日志）
- 浏览器控制台日志（包含所有 `[Header]` 日志）
- 数据库查询结果（用户记录）
- Supabase 用户ID（从 `user.id` 获取）

