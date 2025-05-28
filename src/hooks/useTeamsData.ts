
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Team {
  id: string;
  abbreviation: string;
  full_name: string;
  city: string;
}

export const useTeamsData = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async (): Promise<Team[]> => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('abbreviation');

      if (error) {
        console.error('Error fetching teams:', error);
        throw error;
      }

      return data || [];
    },
  });
};
