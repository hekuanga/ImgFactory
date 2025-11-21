import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '../../../lib/auth-middleware';

// 用户设置响应类型
type SettingsResponse = {
  success: boolean;
  settings?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      [key: string]: any;
    };
    preferences?: {
      language?: string;
      theme?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  error?: string;
};

// 更新用户设置请求体类型
interface UpdateSettingsRequest extends AuthenticatedRequest {
  body: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      [key: string]: any;
    };
    preferences?: {
      language?: string;
      theme?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

export default async function handler(
  req: UpdateSettingsRequest,
  res: NextApiResponse<SettingsResponse>
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - User must be logged in'
      });
    }

    // GET 请求：获取用户设置
    if (req.method === 'GET') {
      // TODO: 实现获取用户设置逻辑
      // 1. 从 req.user.id 获取 Supabase 用户 id
      // 2. 从数据库查询用户设置信息
      // 3. 返回用户设置

      // 临时返回，待实现
      return res.status(200).json({
        success: true,
        settings: {}
      });
    }

    // PUT/PATCH 请求：更新用户设置
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { notifications, preferences, ...otherFields } = req.body;

      // TODO: 实现更新用户设置逻辑
      // 1. 验证请求参数（notifications, preferences 等）
      // 2. 更新数据库中的用户设置
      // 3. 返回更新后的用户设置

      // 临时返回，待实现
      return res.status(200).json({
        success: true,
        settings: {
          notifications,
          preferences
        }
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  } catch (error) {
    console.error('Settings error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

