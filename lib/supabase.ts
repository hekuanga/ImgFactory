import { createClient } from '@supabase/supabase-js';

// Supabase 客户端初始化
// 注意：请确保在 .env.local 中设置以下环境变量：
// NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 创建 Supabase 客户端实例
export const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string);

// 服务端 Supabase 客户端（用于需要服务端权限的操作）
// 注意：请确保在 .env.local 中设置以下环境变量：
// SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseAdmin = createClient(supabaseUrl as string, supabaseServiceRoleKey as string, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});


