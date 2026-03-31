 import { useEffect, useState } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
 
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
       if (!user.email) {
         setHasAccess(false);
         setChecking(false);
         return;
       }
 
       const normalizedEmail = user.email.toLowerCase().trim();
 
       const { data: premiumUser } = await supabase
         .from('premium_users')
         .select('email')
         .ilike('email', normalizedEmail)
         .maybeSingle();
 
       if (cancelled) return;
 
       setHasAccess(!!premiumUser);
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
