# Stripe Checkout 订阅流程使用指南

## 概述

本文档说明如何使用已实现的 Stripe Checkout 订阅流程。

## 流程说明

1. **用户点击订阅** → 前端调用 `/api/billing/checkout`
2. **创建 Stripe Checkout Session** → 后端创建并返回 checkout URL
3. **用户完成支付** → Stripe 重定向到 `/billing/success`
4. **用户取消支付** → Stripe 重定向到 `/billing/cancel`

## 前端调用示例

### 1. 基本用法（React/Next.js）

```typescript
import { supabaseClient } from '../lib/supabaseClient';

async function handleSubscribe(priceId: string) {
  try {
    // 1. 获取当前用户的 session（用于认证）
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError || !session) {
      alert('请先登录');
      return;
    }

    // 2. 调用 checkout API
    const response = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`, // 传递认证 token
      },
      body: JSON.stringify({
        priceId: priceId, // 例如: 'price_xxxxxxxxxxxxx'
        // 可选：自定义重定向 URL
        // successUrl: 'https://yourdomain.com/custom-success',
        // cancelUrl: 'https://yourdomain.com/custom-cancel',
      }),
    });

    const data = await response.json();

    if (!data.success || !data.url) {
      throw new Error(data.error || '创建支付会话失败');
    }

    // 3. 重定向到 Stripe Checkout
    window.location.href = data.url;
  } catch (error) {
    console.error('订阅失败:', error);
    alert('订阅失败，请重试');
  }
}
```

### 2. 使用 React Hook

```typescript
// hooks/useCheckout.ts
import { useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (priceId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('请先登录');
      }

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!data.success || !data.url) {
        throw new Error(data.error || '创建支付会话失败');
      }

      // 重定向到 Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '订阅失败，请重试';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createCheckoutSession, loading, error };
}
```

### 3. 在组件中使用

```typescript
// components/SubscribeButton.tsx
import { useCheckout } from '../hooks/useCheckout';

export function SubscribeButton({ priceId, planName }: { priceId: string; planName: string }) {
  const { createCheckoutSession, loading, error } = useCheckout();

  const handleClick = async () => {
    try {
      await createCheckoutSession(priceId);
    } catch (err) {
      // 错误已在 hook 中处理
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="bg-[#3290EE] text-white px-6 py-3 rounded-lg hover:bg-[#3290EE]/80 disabled:opacity-50"
      >
        {loading ? '处理中...' : `订阅 ${planName}`}
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
```

## API 端点说明

### POST `/api/billing/checkout`

**请求头：**
```
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

**请求体：**
```json
{
  "priceId": "price_xxxxxxxxxxxxx",  // 必需：Stripe 价格 ID
  "successUrl": "https://yourdomain.com/billing/success",  // 可选：成功重定向 URL
  "cancelUrl": "https://yourdomain.com/billing/cancel"     // 可选：取消重定向 URL
}
```

**响应：**
```json
{
  "success": true,
  "sessionId": "cs_test_xxxxxxxxxxxxx",
  "url": "https://checkout.stripe.com/pay/cs_test_xxxxxxxxxxxxx"
}
```

**错误响应：**
```json
{
  "success": false,
  "error": "错误信息"
}
```

## 认证说明

API 使用 Supabase 认证 token 进行身份验证。前端需要：

1. 确保用户已登录（通过 `supabaseClient.auth.getSession()`）
2. 在请求头中传递 `Authorization: Bearer <access_token>`
3. Token 会自动从请求头或 cookie 中提取并验证

## 环境变量

确保以下环境变量已配置：

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_PRICE_BASIC=price_xxxxxxxxxxxxx
STRIPE_PRICE_PRO=price_xxxxxxxxxxxxx

# 站点 URL（用于构建重定向 URL）
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 重定向页面

### `/billing/success`

支付成功后的重定向页面。URL 参数：
- `session_id`: Stripe Checkout Session ID（可选）

### `/billing/cancel`

用户取消支付后的重定向页面。

## 注意事项

1. **价格 ID vs 产品 ID**
   - 使用 **价格 ID** (`price_xxx`)，不是产品 ID (`prod_xxx`)
   - 价格 ID 可以在 Stripe Dashboard > Products > 选择产品 > Pricing 中找到

2. **认证 Token**
   - Token 必须有效且未过期
   - 如果 token 过期，用户需要重新登录

3. **Webhook 处理**
   - 支付成功后的订阅状态更新应在 Webhook 中处理
   - Webhook 端点：`/api/billing/webhook`

4. **Customer 创建**
   - 系统会自动查找或创建 Stripe Customer
   - Customer 的 `metadata.supabase_user_id` 会保存 Supabase 用户 ID

## 完整示例页面

参考 `pages/billing/success.tsx` 和 `pages/billing/cancel.tsx` 了解重定向页面的实现。


