
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
  
  // For now, we're only supporting NBA data from Supabase
  // Filter can be added later when we have league information in the database
  const filteredProps = leagues.includes('NBA') ? allProps : [];
  
  return {
    props: filteredProps,
    isLoading,
    error,
    refetch,
    leagueDisplay: getSelectedLeaguesDisplay(leagues)
  };
};
