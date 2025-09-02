
import { Prop } from '@/types/nba';
import { usePropsData } from '@/hooks/usePropsData';

// Get props for multiple leagues using real data from Supabase
export const getPropsForMultipleLeagues = (leagues: ('NBA' | 'NFL')[]): Prop[] => {
  // This function is now a placeholder - components should use usePropsData hook directly
  // We'll keep this for backward compatibility but recommend using the hook
  console.warn('getPropsForMultipleLeagues is deprecated, use usePropsData hook directly');
  return [];
};

// Get display string for selected leagues
export const getSelectedLeaguesDisplay = (leagues: ('NBA' | 'NFL')[]): string => {
  if (leagues.length === 0) return 'No Leagues';
  if (leagues.length === 1) return leagues[0];
  if (leagues.length === 2) return 'NBA & NFL';
  return leagues.join(', ');
};

// Hook to get props data for multiple leagues
export const useMultiLeagueProps = (leagues: ('NBA' | 'NFL')[] = ['NBA']) => {
  const { data: allProps = [], isLoading, error, refetch } = usePropsData();
  
  // Check for league field issues
  const propsWithLeague = allProps.filter(p => p.league);
  const propsWithoutLeague = allProps.filter(p => !p.league);
  
  // Filter props by selected leagues
  const filteredProps = allProps.filter(prop => {
    // If no league field exists, assume it's NBA for backward compatibility
    const propLeague = prop.league || 'NBA';
    
    // Map league names to our expected format
    const leagueMapping: Record<string, 'NBA' | 'NFL'> = {
      'NBA': 'NBA',
      'NFL': 'NFL',
      '9': 'NFL', // NFL has league_id of 9
      '1': 'NBA'  // NBA has league_id of 1 (assuming)
    };
    
    const mappedLeague = leagueMapping[propLeague] || propLeague as 'NBA' | 'NFL';
    
    return leagues.includes(mappedLeague);
  });
  
  return {
    props: filteredProps,
    isLoading,
    error,
    refetch,
    leagueDisplay: getSelectedLeaguesDisplay(leagues)
  };
};
