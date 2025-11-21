import type { NextApiRequest, NextApiResponse } from 'next';

type DebugResponse = {
  success: boolean;
  env: {
    NEXT_PUBLIC_STRIPE_PRICE_BASIC?: string;
    NEXT_PUBLIC_STRIPE_PRICE_BASIC_length?: number;
    NEXT_PUBLIC_STRIPE_PRICE_BASIC_undefined?: boolean;
    allNextPublicVars?: Record<string, string>;
  };
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DebugResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      env: {},
      error: 'Method not allowed'
    });
  }

  try {
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC;
    
    // 获取所有 NEXT_PUBLIC_ 开头的环境变量
    const allNextPublicVars: Record<string, string> = {};
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('NEXT_PUBLIC_')) {
        allNextPublicVars[key] = process.env[key] || '';
      }
    });

    return res.status(200).json({
      success: true,
      env: {
        NEXT_PUBLIC_STRIPE_PRICE_BASIC: priceId || undefined,
        NEXT_PUBLIC_STRIPE_PRICE_BASIC_length: priceId?.length,
        NEXT_PUBLIC_STRIPE_PRICE_BASIC_undefined: priceId === undefined,
        allNextPublicVars,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      env: {},
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

