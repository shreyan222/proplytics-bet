import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Prop } from '@/types/nba';

export type GetPropsTable = 'props' | 'prop_yday';

export type GetPropsInvokeBody = {
  table: GetPropsTable;
  limitFree?: number;
  orderBy?: { column: string; ascending?: boolean }[];
  filters?: {
    eq?: Record<string, string | number | boolean | null>;
    in?: Record<string, (string | number)[]>;
    gte?: Record<string, string | number>;
    lte?: Record<string, string | number>;
  };
  select?: string;
};

export type GetPropsInvokeResponse = {
  data: any[];
  isPremium: boolean;
  locked: boolean;
};

function mapRowToProp(row: any): Prop {
  const homeTeamAbbr = row.game?.home_team?.abbreviation || row.home_team || 'TBD';
  const awayTeamAbbr = row.game?.away_team?.abbreviation || row.away_team || 'TBD';
  const playerTeam = row.player?.team?.abbreviation || row.team || row.team_name || 'FA';

  let againstTeam = row.against_team;
  if (!againstTeam && homeTeamAbbr !== 'TBD' && awayTeamAbbr !== 'TBD') {
    againstTeam = playerTeam === homeTeamAbbr ? awayTeamAbbr : homeTeamAbbr;
  }
  againstTeam = againstTeam || 'Unknown';

  return {
    prop_id: row.id || row.external_id || row.prop_id || '',
    league: row.league,
    player_id: row.player?.id || row.player_id || '',
    player_name:
      row.player?.display_name || row.player_name || row.player?.player_name || 'Unknown Player',
    position: row.player?.position || row.position || 'N/A',
    team: playerTeam,
    against_team: againstTeam,
    stat_type: row.stat_type,
    line_score: Number(row.line_score),
    odds_type: (row.odds_type || 'standard') as 'standard' | 'demon' | 'goblin',
    game_id: row.game?.id || row.game_id || '',
    start_time: row.game?.start_time || row.start_time || '',
    h2h_array: Array.isArray(row.h2h_array)
      ? row.h2h_array.map(Number)
      : Array.isArray(row.h2h)
        ? row.h2h.map(Number)
        : [],
    l5_array: Array.isArray(row.l5_array)
      ? row.l5_array.map(Number)
      : Array.isArray(row.l5)
        ? row.l5.map(Number)
        : [],
    h2h_avg: Number(row.h2h_avg || 0),
    l5_avg: Number(row.l5_avg || 0),
    h2h_score: Number(row.h2h_score || 0),
    l5_score: Number(row.l5_score || 0),
    sample_size: row.sample_size || 0,
    sorting_score: Number(row.sorting_score || 0),
    sorting_score_computed: Number(row.sorting_score_computed || row.sorting_score || 0),
    h2h_score_computed: Number(row.h2h_score_computed || row.h2h_score || 0),
    l5_score_computed: Number(row.l5_score_computed || row.l5_score || 0),
    h2h_diff_computed: Number(row.h2h_diff_computed || 0),
    l5_diff_computed: Number(row.l5_diff_computed || 0),
    h2h_relative_diff_computed: Number(row.h2h_relative_diff_computed || 0),
    l5_relative_diff_computed: Number(row.l5_relative_diff_computed || 0),
    h2h_percent_computed: Number(row.h2h_percent_computed || 0),
    l5_percent_computed: Number(row.l5_percent_computed || 0),
    matchup_rank: row.matchup_rank ? Number(row.matchup_rank) : null,
    final_matchup_score: row.final_matchup_score ? Number(row.final_matchup_score) : null,
  };
}

export type UseGetPropsResult = {
  props: Prop[];
  isPremium: boolean;
  locked: boolean;
};

export function useGetProps(queryKey: any[], body: GetPropsInvokeBody, enabled = true) {
  return useQuery({
    queryKey,
    enabled,
    queryFn: async (): Promise<UseGetPropsResult> => {
      const { data, error } = await supabase.functions.invoke<GetPropsInvokeResponse>('get-props', {
        body,
      });

      if (error) {
        console.error('get-props invoke error', error);
        throw new Error(error.message || 'Failed to fetch props');
      }

      const rows = data?.data ?? [];
      return {
        props: rows.map(mapRowToProp),
        isPremium: data?.isPremium ?? false,
        locked: data?.locked ?? true,
      };
    },
    retry: 2,
    retryDelay: 1000,
  });
}

