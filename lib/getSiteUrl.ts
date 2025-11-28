/**
 * 获取当前站点的URL（支持Vercel和本地开发）
 * 优先级：NEXT_PUBLIC_SITE_URL > VERCEL_URL > localhost
 */
export function getSiteUrl(): string {
  // 优先使用环境变量中的站点URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }

  // 如果在Vercel环境，使用VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 客户端环境：使用window.location
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }

  // 默认本地开发环境
  return 'http://localhost:3000';
}

/**
 * 获取认证回调URL
 */
export function getAuthCallbackUrl(): string {
  return `${getSiteUrl()}/auth/callback`;
}

