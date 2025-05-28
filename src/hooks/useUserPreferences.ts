
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

interface NotificationSettings {
  new_props: boolean;
  removed_props: boolean;
  line_changes: boolean;
  odds_changes: boolean;
  favorite_players_only: boolean;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  favorite_players: string[];
  favorite_props: string[];
  notification_settings: NotificationSettings;
}

export const useUserPreferences = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async (): Promise<UserPreferences | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user preferences:', error);
        throw error;
      }

      if (!data) return null;

      // Safely parse notification_settings from JSONB
      const notificationSettings: NotificationSettings = typeof data.notification_settings === 'object' && data.notification_settings !== null
        ? data.notification_settings as NotificationSettings
        : {
            new_props: true,
            removed_props: true,
            line_changes: true,
            odds_changes: true,
            favorite_players_only: false,
          };

      return {
        id: data.id,
        user_id: data.user_id,
        favorite_players: data.favorite_players || [],
        favorite_props: data.favorite_props || [],
        notification_settings: notificationSettings,
      };
    },
    enabled: !!user,
  });

  const createPreferences = useMutation({
    mutationFn: async (preferences: Partial<UserPreferences>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          favorite_players: preferences.favorite_players,
          favorite_props: preferences.favorite_props,
          notification_settings: preferences.notification_settings as any,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences', user?.id] });
    },
  });

  const updatePreferences = useMutation({
    mutationFn: async (preferences: Partial<UserPreferences>) => {
      if (!user) throw new Error('User not authenticated');

      const updateData: any = {};
      if (preferences.favorite_players) updateData.favorite_players = preferences.favorite_players;
      if (preferences.favorite_props) updateData.favorite_props = preferences.favorite_props;
      if (preferences.notification_settings) updateData.notification_settings = preferences.notification_settings;

      const { data, error } = await supabase
        .from('user_preferences')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences', user?.id] });
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createPreferences,
    updatePreferences,
  };
};
