 import { useEffect, useState } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
 import { GetPropsInvokeResponse } from '@/hooks/useGetProps';
 
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
       const { data, error } = await supabase.functions.invoke<GetPropsInvokeResponse>('get-props', {
         body: {
           table: 'props',
           limitFree: 1,
           select: 'id',
         },
       });
 
       if (cancelled) return;
 
       if (error) {
         console.error('Subscription access check failed', error);
         setHasAccess(false);
         setChecking(false);
         return;
       }
 
       setHasAccess(!!data?.isPremium);
       setChecking(false);
     })();
 
     return () => {
       cancelled = true;
     };
   }, [user, authLoading, user?.id]);
 
   const loading = authLoading || (!!user && checking);
 
   return {
     loading,
     hasAccess: !!user && hasAccess,
   };
 }
