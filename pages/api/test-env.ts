import type { NextApiRequest, NextApiResponse } from 'next';

type EnvTestResponse = {
  success: boolean;
  stripePriceBasic?: string;
  nodeEnv?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EnvTestResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const stripePriceBasic = process.env.STRIPE_PRICE_BASIC;
    const nodeEnv = process.env.NODE_ENV;

    return res.status(200).json({
      success: true,
      stripePriceBasic: stripePriceBasic || undefined,
      nodeEnv: nodeEnv || undefined,
      error: !stripePriceBasic ? 'STRIPE_PRICE_BASIC is not set' : undefined
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

