import type { NextApiRequest, NextApiResponse } from 'next';
import redis from '../../utils/redis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 移除登录验证，设置默认identifier以保持功能
  const identifier = 'anonymous_user';
  const windowDuration = 24 * 60 * 60 * 1000;
  const bucket = Math.floor(Date.now() / windowDuration);

  // 获取已使用的生成次数（修复和证件照共享）
  // 由于redis导出为null，直接返回默认值0
  const usedGenerations = '0';

  // TODO: Move this using date-fns on the client-side
  const resetDate = new Date();
  resetDate.setHours(19, 0, 0, 0);
  const diff = Math.abs(resetDate.getTime() - new Date().getTime());
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor(diff / 1000 / 60) - hours * 60;

  // 每日限制为2次，修复和证件照生成共用
  const remainingGenerations = 2 - Number(usedGenerations);
  
  // 添加limit字段以保持API兼容性
  return res.status(200).json({ 
    remainingGenerations, 
    hours, 
    minutes,
    limit: 2, // 添加总限制数
    remaining: remainingGenerations // 保持与新API的兼容性
  });
}
