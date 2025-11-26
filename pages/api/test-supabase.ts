import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseClient, supabaseServer } from '../../lib/supabaseClient';

type TestResponse = {
  success: boolean;
  clientConfig: {
    url: string;
    hasAnonKey: boolean;
    hasServiceRoleKey: boolean;
  };
  connectionTest?: {
    success: boolean;
    error?: string;
  };
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestResponse>
) {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      clientConfig: {
        url: '',
        hasAnonKey: false,
        hasServiceRoleKey: false,
      },
      message: 'Method not allowed'
    });
  }

  try {
    // 检查环境变量配置
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const clientConfig = {
      url: supabaseUrl ? `${(supabaseUrl as string).substring(0, 30)}...` : 'Not set',
      hasAnonKey: !!supabaseAnonKey,
      hasServiceRoleKey: !!supabaseServiceRoleKey,
    };

    // 测试连接
    let connectionTest;
    try {
      // 尝试获取健康状态（通过获取当前用户，即使未登录也会返回响应）
      const { error } = await supabaseClient.auth.getSession();
      
      // 如果没有错误或错误是"未找到session"（这是正常的），说明连接正常
      if (!error || error.message.includes('session')) {
        connectionTest = {
          success: true,
        };
      } else {
        connectionTest = {
          success: false,
          error: error.message,
        };
      }
    } catch (err) {
      connectionTest = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }

    return res.status(200).json({
      success: true,
      clientConfig,
      connectionTest,
      message: 'Supabase configuration check completed'
    });
  } catch (error) {
    console.error('Test Supabase error:', error);
    return res.status(500).json({
      success: false,
      clientConfig: {
        url: '',
        hasAnonKey: false,
        hasServiceRoleKey: false,
      },
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

