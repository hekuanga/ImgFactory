import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabaseClient } from '../lib/supabaseClient';

export function useBillingPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPortal = async (returnUrl?: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          returnUrl: returnUrl || `${window.location.origin}/billing`,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        // 重定向到 Stripe Customer Portal
        window.location.href = data.url;
      } else {
        setError(data.error || '创建管理页面失败');
        setLoading(false);
      }
    } catch (err) {
      console.error('Open portal error:', err);
      setError('打开管理页面失败，请重试');
      setLoading(false);
    }
  };

  return { openPortal, loading, error };
}

