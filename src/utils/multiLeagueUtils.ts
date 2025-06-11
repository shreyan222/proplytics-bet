
import { getPropsForLeague } from '@/utils/multiLeagueSampleData';
import { Prop } from '@/types/nba';

export const getPropsForMultipleLeagues = (leagues: ('NBA' | 'NFL' | 'MLB')[]): Prop[] => {
  if (leagues.length === 0) return [];
  
  const allProps: Prop[] = [];
  
  leagues.forEach(league => {
    const leagueProps = getPropsForLeague(league);
    allProps.push(...leagueProps);
  });
  
  // Sort by sorting_score descending to maintain consistent ordering
  return allProps.sort((a, b) => b.sorting_score - a.sorting_score);
};

export const getSelectedLeaguesDisplay = (leagues: ('NBA' | 'NFL' | 'MLB')[]): string => {
  if (leagues.length === 0) return 'No leagues';
  if (leagues.length === 1) return leagues[0];
  if (leagues.length === 2) return leagues.join(' & ');
  if (leagues.length === 3) return 'All Leagues';
  return leagues.join(', ');
};
