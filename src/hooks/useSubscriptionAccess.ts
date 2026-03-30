import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const ACTIVE_STATUSES = ['active', 'trialing'];

export function useSubscriptionAccess() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [checking, setChecking] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setHasAccess(false);
      setChecking(false);
      return;
    }

    let cancelled = false;
    setChecking(true);

    (async () => {
      const { data: byUser } = await supabase
        .from('stripe_subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (cancelled) return;

      if (byUser && ACTIVE_STATUSES.includes(byUser.status)) {
        setHasAccess(true);
        setChecking(false);
        return;
      }

      if (user.email) {
        const { data: byEmail } = await supabase
          .from('stripe_subscriptions')
          .select('status')
          .eq('customer_email', user.email)
          .maybeSingle();

        if (cancelled) return;

        if (byEmail && ACTIVE_STATUSES.includes(byEmail.status)) {
          setHasAccess(true);
          setChecking(false);
          return;
        }
      }

      setHasAccess(false);
      setChecking(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, user?.id, user?.email]);

  const loading = authLoading || (!!user && checking);

  return {
    loading,
    hasAccess: !!user && hasAccess,
  };
}
