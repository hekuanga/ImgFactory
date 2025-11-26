import type { NextApiRequest, NextApiResponse } from 'next';

type HealthResponse = {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  checks?: {
    database?: 'ok' | 'error';
    supabase?: 'ok' | 'error';
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  const startTime = process.uptime();
  
  const health: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(startTime),
    environment: process.env.NODE_ENV || 'development',
    checks: {},
  };

  // 检查数据库连接（可选）
  try {
    const prisma = (await import('../../lib/prismadb')).default;
    await prisma.$queryRaw`SELECT 1`;
    health.checks!.database = 'ok';
  } catch (error) {
    health.checks!.database = 'error';
    health.status = 'error';
  }

  // 检查 Supabase 配置（可选）
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      health.checks!.supabase = 'ok';
    } else {
      health.checks!.supabase = 'error';
      health.status = 'error';
    }
  } catch (error) {
    health.checks!.supabase = 'error';
    health.status = 'error';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
}



