
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { ChangeNotification } from '@/types/nba';

export const useChangeNotifications = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['change-notifications', user?.id],
    queryFn: async (): Promise<ChangeNotification[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('change_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data.map(notification => ({
        id: notification.id,
        type: notification.change_type as 'new' | 'removed' | 'changed',
        prop: notification.prop_data as any,
        timestamp: notification.created_at || new Date().toISOString(),
        changes: notification.changes as Record<string, { previous: any; current: any }>,
      }));
    },
    enabled: !!user,
  });

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('change_notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-notifications', user?.id] });
    },
  });

  // Clear all notifications
  const clearAll = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('change_notifications')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-notifications', user?.id] });
    },
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('change-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'change_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['change-notifications', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return {
    notifications,
    isLoading,
    markAsRead,
    clearAll,
    unreadCount: notifications.length,
  };
};
