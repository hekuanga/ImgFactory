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

// 环境变量检查（不抛出错误，允许应用在没有Supabase时也能运行）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 在开发环境和生产环境都检查（但只在开发环境警告）
// 注意：在构建时（NODE_ENV === 'production' 但还在构建阶段），环境变量可能还未加载
// 因此我们只在运行时检查，构建时只警告，不报错
if (!supabaseUrl || !supabaseAnonKey) {
  // 检查是否在构建时（通过检查 NEXT_PHASE 来判断）
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                      process.env.NEXT_PHASE === 'phase-development-build';
  
  if (process.env.NODE_ENV === 'development') {
    console.warn('Warning: Missing Supabase environment variables:');
    console.warn('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl || 'MISSING');
    console.warn('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING');
    console.warn('Auth features will be disabled');
  } else if (isBuildTime) {
    // 构建时：只警告，不报错（允许构建继续）
    // 使用 console.warn 而不是 console.error，避免构建失败
    console.warn('⚠️  Warning: Missing Supabase environment variables during build');
    console.warn('   Please ensure environment variables are set in Vercel');
    console.warn('   The app will use placeholder values, but auth features will not work');
    console.warn('   See docs/VERCEL_ENV_VARIABLES.md for configuration instructions');
  } else {
    // 运行时（生产环境）：记录警告（不报错，避免应用崩溃）
    // 使用 console.warn 而不是 console.error，避免在运行时被视为错误
    console.warn('⚠️  Warning: Missing Supabase environment variables in production runtime');
    console.warn('   Please check Vercel environment variables configuration');
    console.warn('   Auth features will be disabled');
    console.warn('   See docs/VERCEL_ENV_VARIABLES.md for configuration instructions');
  }
}

/**
 * 客户端 Supabase 客户端（用于客户端代码）
 * 使用匿名 key，受 RLS（Row Level Security）策略限制
 * 如果环境变量缺失，使用占位符值以避免应用崩溃
 */
export const supabaseClient: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // 添加重试配置
      flowType: 'pkce',
      // 增加超时时间
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'supabase.auth.token'
    },
    // 添加全局配置以提高网络请求的可靠性
    global: {
      headers: {
        'X-Client-Info': 'restorephotos-web'
      },
      // 添加 fetch 选项以提高网络可靠性（仅在客户端）
      ...(typeof window !== 'undefined' && {
        fetch: (url: any, options: any = {}) => {
          // 增加超时时间到 30 秒
          const timeout = 30000;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          
          return fetch(url, {
            ...options,
            signal: controller.signal,
          }).finally(() => {
            clearTimeout(timeoutId);
          });
        }
      })
    }
  }
);

/**
 * 服务端 Supabase 客户端（用于 API 路由和服务器端代码）
 * 使用 Service Role Key，绕过 RLS 策略
 * 仅在服务端使用，不要暴露到客户端
 * 如果环境变量缺失，使用占位符值以避免应用崩溃
 */
export const supabaseServer: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  (supabaseServiceRoleKey || supabaseAnonKey || 'placeholder-service-key') as string,
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
  // 如果环境变量缺失，使用占位符值（允许应用在没有Supabase时也能运行）
  const url = supabaseUrl || 'https://placeholder.supabase.co';
  const key = supabaseAnonKey || 'placeholder-anon-key';
  
  const client = createClient<Database>(
    url,
    key,
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

