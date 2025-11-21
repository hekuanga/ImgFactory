import type { NextApiRequest, NextApiResponse } from 'next';

type DbEnvTestResponse = {
  success: boolean;
  databaseUrl?: string;
  databaseHost?: string;
  isPoolerMode?: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DbEnvTestResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    // 解析数据库 URL 以提取主机
    let databaseHost = '';
    let isPoolerMode = false;
    
    if (databaseUrl) {
      try {
        const url = new URL(databaseUrl);
        databaseHost = url.hostname;
        // 检查是否是连接池模式
        isPoolerMode = databaseHost.includes('pooler.supabase.com');
      } catch (e) {
        // URL 解析失败，尝试字符串匹配
        const match = databaseUrl.match(/@([^:]+):/);
        if (match) {
          databaseHost = match[1];
          isPoolerMode = databaseHost.includes('pooler.supabase.com');
        }
      }
    }

    return res.status(200).json({
      success: true,
      databaseUrl: databaseUrl ? databaseUrl.replace(/:[^:@]+@/, ':****@') : undefined, // 隐藏密码
      databaseHost,
      isPoolerMode,
      error: !databaseUrl ? 'DATABASE_URL is not set' : (!isPoolerMode ? 'Not using pooler mode' : undefined)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

