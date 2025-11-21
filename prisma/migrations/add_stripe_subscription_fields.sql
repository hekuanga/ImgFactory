-- 添加 Stripe 订阅相关字段到 users 表
-- 如果使用 Prisma migrate，此文件会自动生成
-- 如果手动执行，请先备份数据库

-- 添加 is_subscribed 字段（用户是否已订阅）
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN DEFAULT false;

-- 添加 stripe_customer_id 字段（Stripe Customer ID）
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- 添加 stripe_subscription_id 字段（Stripe Subscription ID）
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);

-- 添加 subscription_status 字段（订阅状态：active, canceled, past_due 等）
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50);

-- 添加 subscription_tier 字段（订阅等级：free, pro, vip）
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free';

-- 添加 current_period_end 字段（当前订阅周期结束时间）
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON users(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_is_subscribed ON users(is_subscribed);
CREATE INDEX IF NOT EXISTS idx_users_current_period_end ON users(current_period_end);

-- 添加注释
COMMENT ON COLUMN users.is_subscribed IS '用户是否已订阅';
COMMENT ON COLUMN users.stripe_customer_id IS 'Stripe Customer ID';
COMMENT ON COLUMN users.stripe_subscription_id IS 'Stripe Subscription ID';
COMMENT ON COLUMN users.subscription_status IS '订阅状态：active, canceled, past_due, trialing, unpaid 等';
COMMENT ON COLUMN users.subscription_tier IS '订阅等级：free, pro, vip';
COMMENT ON COLUMN users.current_period_end IS '当前订阅周期结束时间（Unix 时间戳转换）';

