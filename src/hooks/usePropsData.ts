
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Prop } from '@/types/nba';

export const usePropsData = () => {
  return useQuery({
    queryKey: ['props'],
    queryFn: async (): Promise<Prop[]> => {
      console.log('Fetching props data from Supabase...');
      
      const { data, error } = await supabase
        .from('props')
        .select(`
          id,
          external_id,
          stat_type,
          line_score,
          odds_type,
          h2h_array,
          l5_array,
          h2h_avg,
          l5_avg,
          h2h_score,
          l5_score,
          sample_size,
          sorting_score,
          created_at,
          updated_at,
          player:players (
            id,
            display_name,
            position,
            team:teams (
              abbreviation
            )
          ),
          game:games (
            id,
            start_time,
            home_team:home_team_id (
              abbreviation
            ),
            away_team:away_team_id (
              abbreviation
            )
          )
        `)
        .order('sorting_score', { ascending: false });

      if (error) {
        console.error('Error fetching props:', error);
        throw new Error(`Failed to fetch props: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.log('No props data returned from Supabase');
        return [];
      }

      console.log(`Successfully fetched ${data.length} props from Supabase`);

      // Transform the data to match our Prop interface
      const transformedData: Prop[] = data.map((prop: any) => {
        // Safely extract team abbreviations
        const homeTeamAbbr = prop.game?.home_team?.abbreviation || 'TBD';
        const awayTeamAbbr = prop.game?.away_team?.abbreviation || 'TBD';
        const playerTeam = prop.player?.team?.abbreviation || 'FA';
        
        // Determine opponent team
        const againstTeam = playerTeam === homeTeamAbbr ? awayTeamAbbr : homeTeamAbbr;

        return {
          prop_id: prop.id,
          player_id: prop.player?.id || '',
          player_name: prop.player?.display_name || 'Unknown Player',
          position: prop.player?.position || 'N/A',
          team: playerTeam,
          against_team: againstTeam,
          stat_type: prop.stat_type,
          line_score: Number(prop.line_score),
          odds_type: prop.odds_type as 'standard' | 'demon' | 'goblin',
          game_id: prop.game?.id || '',
          start_time: prop.game?.start_time || '',
          h2h_array: Array.isArray(prop.h2h_array) ? prop.h2h_array.map(Number) : [],
          l5_array: Array.isArray(prop.l5_array) ? prop.l5_array.map(Number) : [],
          h2h_avg: Number(prop.h2h_avg),
          l5_avg: Number(prop.l5_avg),
          h2h_score: Number(prop.h2h_score),
          l5_score: Number(prop.l5_score),
          sample_size: prop.sample_size,
          sorting_score: Number(prop.sorting_score),
        };
      });

      console.log(`Transformed ${transformedData.length} props for display`);
      return transformedData;
    },
    refetchInterval: 60000, // Refetch every minute for real-time updates
    retry: 3,
    retryDelay: 1000,
  });
};
