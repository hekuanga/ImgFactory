import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '../../../lib/auth-middleware';

// 用户资料响应类型
type ProfileResponse = {
  success: boolean;
  profile?: {
    id: string;
    email?: string;
    name?: string;
    image?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
  };
  error?: string;
};

// 更新用户资料请求体类型
interface UpdateProfileRequest extends AuthenticatedRequest {
  body: {
    name?: string;
    image?: string;
    [key: string]: any;
  };
}

export default async function handler(
  req: UpdateProfileRequest,
  res: NextApiResponse<ProfileResponse>
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - User must be logged in'
      });
    }

    // GET 请求：获取用户资料
    if (req.method === 'GET') {
      // TODO: 实现获取用户资料逻辑
      // 1. 从 req.user.id 获取 Supabase 用户 id
      // 2. 从 Supabase 或数据库查询用户资料信息
      // 3. 返回用户资料

      // 临时返回，待实现
      return res.status(200).json({
        success: true,
        profile: {
          id: userId,
          email: req.user?.email
        }
      });
    }

    // PUT/PATCH 请求：更新用户资料
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { name, image, ...otherFields } = req.body;

      // TODO: 实现更新用户资料逻辑
      // 1. 验证请求参数（name, image 等）
      // 2. 更新 Supabase 用户资料或数据库中的用户信息
      // 3. 返回更新后的用户资料

      // 临时返回，待实现
      return res.status(200).json({
        success: true,
        profile: {
          id: userId,
          name,
          image
        }
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

