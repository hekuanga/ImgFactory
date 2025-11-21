-- RestorePhotos 数据库初始化脚本
-- 此脚本在数据库首次启动时自动执行

-- 创建主数据库（PostgreSQL不支持IF NOT EXISTS，使用条件创建）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'restorephotos') THEN
        CREATE DATABASE restorephotos;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'restorephotos_shadow') THEN
        CREATE DATABASE restorephotos_shadow;
    END IF;
END
$$;

-- 切换到主数据库
\c restorephotos;

-- 创建必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建用户表（如果需要用户认证）
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    name VARCHAR(255),
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建图像处理记录表
CREATE TABLE IF NOT EXISTS image_processing_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    original_image_url TEXT,
    processed_image_url TEXT,
    processing_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 创建使用限制表（用于API调用限制）
CREATE TABLE IF NOT EXISTS usage_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    api_calls_count INTEGER DEFAULT 0,
    last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_image_processing_user_id ON image_processing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_user_id ON usage_limits(user_id);

-- 设置权限
GRANT ALL PRIVILEGES ON DATABASE restorephotos TO postgres;
GRANT ALL PRIVILEGES ON DATABASE restorephotos_shadow TO postgres;

-- 为恢复过程添加注释
COMMENT ON TABLE users IS '系统用户信息表';
COMMENT ON TABLE image_processing_history IS '图像处理历史记录表';
COMMENT ON TABLE usage_limits IS 'API使用限制表';

-- 显示创建的表
\dt

-- 输出初始化完成信息
SELECT 'RestorePhotos 数据库初始化完成' AS status;