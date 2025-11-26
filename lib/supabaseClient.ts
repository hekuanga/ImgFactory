import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase 数据库类型定义（根据你的数据库结构定义）
// TODO: 使用 Supabase CLI 生成类型：npx supabase gen types typescript --project-id <project-id> > types/supabase.ts
export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, any>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, any>;
        Returns: any;
      };
    };
  };
};

// 环境变量检查
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/**
 * 客户端 Supabase 客户端（用于客户端代码）
 * 使用匿名 key，受 RLS（Row Level Security）策略限制
 */
export const supabaseClient: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

/**
 * 服务端 Supabase 客户端（用于 API 路由和服务器端代码）
 * 使用 Service Role Key，绕过 RLS 策略
 * 仅在服务端使用，不要暴露到客户端
 */
export const supabaseServer: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey || supabaseAnonKey, // 如果没有 service role key，回退到 anon key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * 从请求中创建服务端 Supabase 客户端（用于 API 路由）
 * 可以传入用户的 access token 来模拟用户请求
 * @param accessToken - 用户的访问令牌（可选）
 * @returns Supabase 客户端实例
 */
export function createServerClient(accessToken?: string): SupabaseClient<Database> {
  // 确保环境变量已设置（运行时检查）
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required Supabase environment variables');
  }
  
  // 使用类型断言，因为我们已经检查过这些值不会是 undefined
  const client = createClient<Database>(
    supabaseUrl as string,
    supabaseAnonKey as string,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`
            }
          : {}
      }
    }
  );

  return client;
}

/**
 * 从请求头中提取 token 并创建客户端
 * @param authHeader - Authorization 请求头（格式：Bearer <token>）
 * @returns Supabase 客户端实例
 */
export function createClientFromAuthHeader(authHeader?: string): SupabaseClient<Database> {
  const token = authHeader?.replace('Bearer ', '');
  return createServerClient(token);
}

// 默认导出客户端（用于向后兼容）
export default supabaseClient;

