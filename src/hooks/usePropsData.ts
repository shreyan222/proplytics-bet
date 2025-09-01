
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Prop } from '@/types/nba';

export const usePropsData = () => {
  return useQuery({
    queryKey: ['props'],
    queryFn: async (): Promise<Prop[]> => {
      // First, get the total count to know how many rows we need to fetch
      // Note: This count includes all rows that match your RLS policies
      const { count, error: countError } = await supabase
        .from('props')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error getting count:', countError);
        throw new Error(`Failed to get props count: ${countError.message}`);
      }

      // Fetch all props using pagination to handle large datasets
      // Supabase has a default limit of 1000 rows per query
      // This approach ensures we get all data while maintaining good performance
      let allData: any[] = [];
      const batchSize = 1000; // Supabase's default limit
      let offset = 0;
      let hasMore = true;
      let batchCount = 0;
      const maxBatches = Math.ceil((count || 0) / batchSize) + 2; // Safety limit

      while (hasMore && batchCount < maxBatches) {
        batchCount++;
        
        const { data: batchData, error } = await supabase
          .from('props')
          .select(`
            id,
            league,
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
            sorting_score_computed,
            h2h_score_computed,
            l5_score_computed,
            h2h_diff_computed,
            l5_diff_computed,
            h2h_relative_diff_computed,
            l5_relative_diff_computed,
            h2h_percent_computed,
            l5_percent_computed,
            matchup_rank,
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
          .order('sorting_score_computed', { ascending: false })
          .range(offset, offset + batchSize - 1);

        if (error) {
          console.error('Error fetching props batch:', error);
          throw new Error(`Failed to fetch props batch: ${error.message}`);
        }

        if (!batchData || batchData.length === 0) {
          hasMore = false;
        } else {
          allData = allData.concat(batchData);
          offset += batchSize;
          
          // If we got fewer rows than the batch size, we've reached the end
          if (batchData.length < batchSize) {
            hasMore = false;
          }
          
        }
      }

      let data = allData;

      // Check if we hit the safety limit
      if (batchCount >= maxBatches) {
        console.warn(`⚠️ Warning: Hit maximum batch limit (${maxBatches}). This might indicate an issue with pagination.`);
      }

      // If we didn't get all the data, try a different approach
      if (data.length < (count || 0)) {
        try {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('props')
            .select(`
              id,
              league,
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
              sorting_score_computed,
              h2h_score_computed,
              l5_score_computed,
              h2h_diff_computed,
              l5_diff_computed,
              h2h_relative_diff_computed,
              l5_relative_diff_computed,
              h2h_percent_computed,
              l5_percent_computed,
              matchup_rank,
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
            .order('sorting_score_computed', { ascending: false });

          if (fallbackError) {
            console.error('Fallback query also failed:', fallbackError);
          } else if (fallbackData && fallbackData.length > data.length) {
            allData = fallbackData;
            data = fallbackData;
          }
        } catch (fallbackErr) {
          console.error('Fallback query failed:', fallbackErr);
        }
      }

      // No need to check for error here since we handle it in the loop above

      if (!data || data.length === 0) {
        return [];
      }
      
      if (data.length < (count || 0)) {
        console.warn(`⚠️ Warning: Only fetched ${data.length} props out of ${count} total. This might indicate a limit issue.`);
      }

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
          league: prop.league,
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
          sorting_score_computed: Number(prop.sorting_score_computed || 0),
          h2h_score_computed: Number(prop.h2h_score_computed || 0),
          l5_score_computed: Number(prop.l5_score_computed || 0),
          h2h_diff_computed: Number(prop.h2h_diff_computed || 0),
          l5_diff_computed: Number(prop.l5_diff_computed || 0),
          h2h_relative_diff_computed: Number(prop.h2h_relative_diff_computed || 0),
          l5_relative_diff_computed: Number(prop.l5_relative_diff_computed || 0),
          h2h_percent_computed: Number(prop.h2h_percent_computed || 0),
          l5_percent_computed: Number(prop.l5_percent_computed || 0),
          matchup_rank: prop.matchup_rank ? Number(prop.matchup_rank) : null,
        };
      });

      if (transformedData.length !== data.length) {
        console.warn(`⚠️ Warning: Data loss during transformation! Original: ${data.length}, Transformed: ${transformedData.length}`);
      }
      
      return transformedData;
    },
    refetchInterval: 60000, // Refetch every minute for real-time updates
    retry: 3,
    retryDelay: 1000,
  });
};
