import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Prop } from '@/types/nba';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

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

  return {
    ...row,
    home_team: homeTeamAbbr,
    away_team: awayTeamAbbr,
    h2h_array: row.h2h_array || [],
    l5_array: row.l5_array || [],
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

export function useGetProps(
  queryKey: any[],
  body: GetPropsInvokeBody,
  enabled = true
) {
  const { user, loading } = useSupabaseAuth();
  const isQueryEnabled = enabled && !loading && !!user;

  return useQuery({
    queryKey,
    enabled: isQueryEnabled,
    queryFn: async (): Promise<UseGetPropsResult> => {
      if (!user) {
        return {
          props: [],
          isPremium: false,
          locked: true,
        };
      }

      const { data, error } = await supabase.functions.invoke<GetPropsInvokeResponse>(
        'get-props',
        {
          body,
        }
      );

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
