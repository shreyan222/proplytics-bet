import { useState, useMemo, useCallback } from 'react';
import { NormalizedProp, GroupedProps, SearchFilters, SearchResult } from '@/types/nba';
import { usePropsData } from './usePropsData';

export const useNormalizedSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  
  const { data, isLoading, error } = usePropsData();
  const allProps = data?.props ?? [];

  // Transform legacy props to normalized schema
  const normalizedProps = useMemo(() => {
    return allProps.map(prop => {
      // Ensure we have a valid stat_type, with intelligent fallbacks
      let propType = prop.stat_type;
      
      // If stat_type is missing or empty, try to infer from other fields
      if (!propType || propType.trim() === '') {
        // Try to infer from position or other available data
        if (prop.position) {
          const position = prop.position.toLowerCase();
          if (position.includes('qb')) {
            propType = 'Passing Yards';
          } else if (position.includes('rb')) {
            propType = 'Rushing Yards';
          } else if (position.includes('wr') || position.includes('te')) {
            propType = 'Receiving Yards';
          } else if (position.includes('k')) {
            propType = 'Field Goals';
          } else {
            propType = 'Points';
          }
        } else {
          // If no position, try to infer from the line score value
          if (prop.line_score > 100) {
            propType = 'Yards';
          } else if (prop.line_score > 10) {
            propType = 'Points';
          } else if (prop.line_score > 1) {
            propType = 'Touchdowns';
          } else {
            propType = 'Field Goals';
          }
        }
      }
      
      // Clean up the prop type to make it more readable
      if (propType) {
        // Convert common abbreviations to full names
        propType = propType
          .replace(/pts/i, 'Points')
          .replace(/yds/i, 'Yards')
          .replace(/tds/i, 'Touchdowns')
          .replace(/fg/i, 'Field Goals')
          .replace(/pass/i, 'Passing')
          .replace(/rush/i, 'Rushing')
          .replace(/rec/i, 'Receiving');
      }
      
      const normalized = {
        id: prop.prop_id,
        player: prop.player_name,
        prop_type: propType || 'Unknown',
        odd_type: prop.odds_type === 'standard' ? 'Standard' : 
                  prop.odds_type === 'goblin' ? 'Goblin' : 'Demon',
        line: prop.line_score,
        odds: -110, // Default odds since not in current schema
        team: prop.team,
        opponent: prop.against_team,
        position: prop.position,
        start_time: prop.start_time,
        league: prop.league || 'NBA',
        h2h_avg: prop.h2h_avg,
        l5_avg: prop.l5_avg,
        sorting_score: prop.sorting_score_computed || prop.sorting_score,
        sample_size: prop.sample_size
      } as NormalizedProp;
      
      return normalized;
    });
  }, [allProps]);

  // Search by player name (case-insensitive)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const matchingProps = normalizedProps.filter(prop => 
      prop.player.toLowerCase().includes(query)
    );

    // Group by player and prop type
    const grouped = matchingProps.reduce((acc, prop) => {
      if (!acc[prop.player]) {
        acc[prop.player] = {
          player: prop.player,
          prop_types: {},
          total_props: 0
        };
      }

      if (!acc[prop.player].prop_types[prop.prop_type]) {
        acc[prop.player].prop_types[prop.prop_type] = {};
      }

      if (!acc[prop.player].prop_types[prop.prop_type][prop.odd_type]) {
        acc[prop.player].prop_types[prop.prop_type][prop.odd_type] = [];
      }

      acc[prop.player].prop_types[prop.prop_type][prop.odd_type].push(prop);
      acc[prop.player].total_props++;
      
      return acc;
    }, {} as Record<string, GroupedProps>);

    return Object.values(grouped);
  }, [normalizedProps, searchQuery]);

  // Apply filters to search results
  const filteredResults = useMemo(() => {
    if (Object.keys(filters).length === 0) return searchResults;

    return searchResults.map(group => {
      const filteredPropTypes: GroupedProps['prop_types'] = {};
      
      Object.entries(group.prop_types).forEach(([propType, oddTypes]) => {
        // Filter by prop type
        if (filters.prop_type && filters.prop_type.length > 0) {
          if (!filters.prop_type.some(type => 
            propType.toLowerCase().includes(type.toLowerCase())
          )) {
            return;
          }
        }

        const filteredOddTypes: Record<string, NormalizedProp[]> = {};
        
        Object.entries(oddTypes).forEach(([oddType, props]) => {
          // Filter by odd type
          if (filters.odd_type && filters.odd_type.length > 0) {
            if (!filters.odd_type.includes(oddType)) {
              return;
            }
          }

          const filteredProps = props.filter(prop => {
            // Filter by line range
            if (filters.min_line && prop.line < filters.min_line) return false;
            if (filters.max_line && prop.line > filters.max_line) return false;
            
            // Filter by odds range
            if (filters.min_odds && prop.odds < filters.min_odds) return false;
            if (filters.max_odds && prop.odds > filters.max_odds) return false;
            
            // Filter by team
            if (filters.team && filters.team.length > 0) {
              if (!filters.team.includes(prop.team || '')) return false;
            }
            
            // Filter by position
            if (filters.position && filters.position.length > 0) {
              if (!filters.position.includes(prop.position || '')) return false;
            }
            
            // Filter by league
            if (filters.league && filters.league.length > 0) {
              if (!filters.league.includes(prop.league || '')) return false;
            }
            
            return true;
          });

          if (filteredProps.length > 0) {
            filteredOddTypes[oddType] = filteredProps;
          }
        });

        if (Object.keys(filteredOddTypes).length > 0) {
          filteredPropTypes[propType] = filteredOddTypes;
        }
      });

      const totalFilteredProps = Object.values(filteredPropTypes)
        .reduce((sum, oddTypes) => 
          sum + Object.values(oddTypes).reduce((s, props) => s + props.length, 0), 0
        );

      return {
        ...group,
        prop_types: filteredPropTypes,
        total_props: totalFilteredProps
      };
    }).filter(group => group.total_props > 0);
  }, [searchResults, filters]);

  // Get player suggestions for autocomplete
  const playerSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const uniquePlayers = new Set<string>();
    
    normalizedProps.forEach(prop => {
      if (prop.player.toLowerCase().includes(query)) {
        uniquePlayers.add(prop.player);
      }
    });
    
    return Array.from(uniquePlayers)
      .sort()
      .slice(0, 10);
  }, [normalizedProps, searchQuery]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  });

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
  });

  // Get all available filter options
  const availableFilters = useMemo(() => {
    const propTypes = new Set<string>();
    const oddTypes = new Set<string>();
    const teams = new Set<string>();
    const positions = new Set<string>();
    const leagues = new Set<string>();

    normalizedProps.forEach(prop => {
      propTypes.add(prop.prop_type);
      oddTypes.add(prop.odd_type);
      if (prop.team) teams.add(prop.team);
      if (prop.position) positions.add(prop.position);
      if (prop.league) leagues.add(prop.league);
    });

    return {
      prop_types: Array.from(propTypes).sort(),
      odd_types: Array.from(oddTypes).sort(),
      teams: Array.from(teams).sort(),
      positions: Array.from(positions).sort(),
      leagues: Array.from(leagues).sort()
    };
  }, [normalizedProps]);

  return {
    // State
    searchQuery,
    setSearchQuery,
    filters,
    selectedPlayer,
    setSelectedPlayer,
    
    // Data
    searchResults: filteredResults,
    playerSuggestions,
    availableFilters,
    isLoading,
    error,
    
    // Actions
    updateFilters,
    clearFilters,
    
    // Computed
    totalResults: filteredResults.reduce((sum, group) => sum + group.total_props, 0),
    hasResults: filteredResults.length > 0,
    hasFilters: Object.keys(filters).length > 0
  };
};
