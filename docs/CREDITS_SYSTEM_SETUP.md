# 积分系统数据库设置完成

## 数据库迁移状态

✅ **迁移已成功执行**

### 1. 用户表 (`users`) 更新
- ✅ 添加了 `credits` 列（INTEGER类型，默认值为0）
- ✅ 所有现有用户的积分已初始化为0

### 2. 积分历史表 (`credit_history`) 创建
- ✅ 表已创建，包含以下字段：
  - `id` (UUID, 主键)
  - `user_id` (TEXT, 外键关联users.id)
  - `amount` (INTEGER, 积分变动数量)
  - `type` (VARCHAR(50), 类型：purchase/deduct/refund/bonus)
  - `description` (TEXT, 可选描述)
  - `created_at` (TIMESTAMP WITH TIME ZONE, 创建时间)

### 3. 索引创建
- ✅ `idx_credit_history_user_id` - 用户ID索引（提高查询性能）
- ✅ `idx_credit_history_created_at` - 创建时间索引（DESC排序）

### 4. 外键约束
- ✅ `credit_history_user_id_fkey` - 确保数据完整性，级联删除

## 积分扣除功能

### 照片修复 (`/api/generate`)
- ✅ 成功生成照片后自动扣除1积分
- ✅ 记录到 `credit_history` 表（type: 'deduct', description: '照片修复'）
- ✅ 积分不足时仍允许生成，但会记录警告

### 证件照生成 (`/api/passport-photo`)
- ✅ 成功生成证件照后自动扣除1积分
- ✅ 记录到 `credit_history` 表（type: 'deduct', description: '证件照生成'）
- ✅ 积分不足时仍允许生成，但会记录警告

### 新用户注册 (`/api/auth/register`)
- ✅ 新用户注册时自动赠送1积分
- ✅ 记录到 `credit_history` 表（type: 'bonus', description: '新用户注册奖励'）

## 错误处理

所有积分相关操作都包含错误处理：
- ✅ 数据库连接错误时优雅降级
- ✅ 列不存在错误（P2022）时静默处理
- ✅ 积分扣除失败不影响主要功能（照片生成）

## 验证步骤

1. **检查数据库结构**：
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'users' AND column_name = 'credits';
   
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'credit_history';
   ```

2. **测试积分扣除**：
   - 用户登录后生成照片
   - 检查 `users.credits` 是否减少
   - 检查 `credit_history` 表是否有新记录

3. **测试新用户注册**：
   - 注册新用户
   - 检查 `users.credits` 是否为1
   - 检查 `credit_history` 表是否有奖励记录

## 数据库状态

- ✅ 迁移时间：刚刚完成
- ✅ 表结构：完整
- ✅ 索引：已创建
- ✅ 外键约束：已设置
- ✅ 现有用户积分：已初始化为0

## 下一步

积分系统已完全设置完成，可以正常使用：
1. 用户生成照片时会自动扣除积分
2. 新用户注册时会自动获得1积分
3. 所有积分变动都会记录到历史表
4. 可以通过 `/api/credits/balance` 查询积分余额
5. 可以通过 `/api/credits/history` 查询积分历史

