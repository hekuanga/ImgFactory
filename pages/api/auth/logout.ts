import type { NextApiRequest, NextApiResponse } from 'next';

// 登出响应类型
type LogoutResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LogoutResponse>
) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // TODO: 实现登出逻辑
    // 1. 从请求中获取会话 token 或从 cookie 中获取
    // 2. 调用 Supabase Auth API 登出
    // 3. 清除客户端会话和 cookie
    // 4. 返回登出结果

    // 临时返回，待实现
    return res.status(200).json({
      success: true,
      message: 'Logout endpoint - implementation pending'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}


