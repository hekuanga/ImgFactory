import type { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '../../../lib/auth-middleware';

// 用户信息响应类型
type UserResponse = {
  success: boolean;
  user?: any;
  error?: string;
};

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<UserResponse>
) {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // TODO: 实现获取用户信息逻辑
    // 1. 从 req.user.id 获取 Supabase 用户 id（如果已通过中间件认证）
    // 2. 或从请求头或 cookie 中获取认证 token 并验证
    // 3. 调用 Supabase Auth API 获取用户信息
    // 4. 可选：从数据库获取额外的用户资料信息
    // 5. 返回用户信息

    const userId = req.user?.id;

    // 临时返回，待实现
    return res.status(200).json({
      success: true,
      user: userId ? { id: userId, email: req.user?.email } : null
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}


