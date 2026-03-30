
import { useMemo } from 'react';
import { Prop, PropFilters } from '@/types/nba';

export const useFilteredProps = (props: Prop[], filters: PropFilters) => {
  return useMemo(() => {
    return props.filter((prop) => {
      // Score range filter
      if (filters.min_score !== undefined && prop.sorting_score < filters.min_score) {
        return false;
      }
      if (filters.max_score !== undefined && prop.sorting_score > filters.max_score) {
        return false;
      }

      // Sample size filter
      if (filters.min_sample_size !== undefined && prop.sample_size < filters.min_sample_size) {
        return false;
      }
      if (filters.sample_sizes && filters.sample_sizes.length > 0) {
        if (!filters.sample_sizes.includes(prop.sample_size)) {
          return false;
        }
      }

      // Odds types filter
      if (filters.odds_types && filters.odds_types.length > 0) {
        if (!filters.odds_types.includes(prop.odds_type)) {
          return false;
        }
      }

      // Stat types filter
      if (filters.stat_types && filters.stat_types.length > 0) {
        if (!filters.stat_types.includes(prop.stat_type)) {
          return false;
        }
      }

      // Teams filter
      if (filters.teams && filters.teams.length > 0) {
        if (!filters.teams.includes(prop.team)) {
          return false;
        }
      }

      // Positions filter
      if (filters.positions && filters.positions.length > 0) {
        if (!filters.positions.includes(prop.position)) {
          return false;
        }
      }

      return true;
    });
  }, [props, filters]);
};
