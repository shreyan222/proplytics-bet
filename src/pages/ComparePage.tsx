import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Prop, NormalizedProp } from '@/types/nba';
import { Search, X, GitCompare, Download, Share2, RefreshCw, User } from 'lucide-react';
import { ComparisonTable } from '@/components/ComparisonTable';
import { useDebounce } from '@/hooks/useDebounce';
import { LeagueSelector } from '@/components/LeagueSelector';
import { useMultiLeagueProps } from '@/utils/multiLeagueUtils';
import { useNormalizedSearch } from '@/hooks/useNormalizedSearch';

export const ComparePage: React.FC = () => {
  const [selectedLeagues, setSelectedLeagues] = useState<('NBA' | 'NFL')[]>(['NBA']);
  const { props, isLoading, error, refetch, leagueDisplay } = useMultiLeagueProps(selectedLeagues);
  
  // New normalized search
  const {
    searchQuery,
    setSearchQuery,
    filters,
    searchResults,
    playerSuggestions,
    availableFilters,
    updateFilters,
    clearFilters,
    totalResults,
    hasResults
  } = useNormalizedSearch();
  
  const [selectedProps, setSelectedProps] = useState<Prop[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Load saved props from localStorage on mount
  useEffect(() => {
    const savedProps = localStorage.getItem('comparisonProps');
    if (savedProps) {
      try {
        const parsedProps = JSON.parse(savedProps);
        setSelectedProps(parsedProps);
      } catch (error) {
        console.error('Error parsing saved comparison props:', error);
        localStorage.removeItem('comparisonProps');
      }
    }
  }, []);

  // Save props to localStorage whenever they change
  useEffect(() => {
    if (selectedProps.length > 0) {
      localStorage.setItem('comparisonProps', JSON.stringify(selectedProps));
    } else {
      localStorage.removeItem('comparisonProps');
    }
  }, [selectedProps]);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Legacy search for backward compatibility
  const legacySearchResults = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return [];
    
    const query = debouncedSearchQuery.toLowerCase();
    return props
      .filter(prop => {
        return (
          prop.player_name.toLowerCase().includes(query) ||
          prop.team.toLowerCase().includes(query) ||
          prop.against_team.toLowerCase().includes(query) ||
          prop.stat_type.toLowerCase().includes(query)
        );
      })
      .slice(0, 10)
      .sort((a, b) => b.sorting_score - a.sorting_score);
  }, [props, debouncedSearchQuery]);

  // Convert normalized prop to legacy prop for comparison
  const convertToLegacyProp = (normalizedProp: NormalizedProp): Prop => {
    // Find matching prop from legacy data
    const matchingProp = props.find(p => 
      p.prop_id === normalizedProp.id ||
      (p.player_name === normalizedProp.player && 
       p.stat_type === normalizedProp.prop_type &&
       p.line_score === normalizedProp.line)
    );
    
    if (matchingProp) {
      return matchingProp;
    }
    
    // Create a new prop if no match found
    return {
      prop_id: normalizedProp.id,
      player_id: normalizedProp.id,
      player_name: normalizedProp.player,
      position: normalizedProp.position || 'Unknown',
      team: normalizedProp.team || 'Unknown',
      against_team: normalizedProp.opponent || 'Unknown',
      stat_type: normalizedProp.prop_type,
      line_score: normalizedProp.line,
      odds_type: normalizedProp.odd_type === 'Standard' ? 'standard' : 
                 normalizedProp.odd_type === 'Goblin' ? 'goblin' : 'demon',
      game_id: normalizedProp.id,
      start_time: normalizedProp.start_time || new Date().toISOString(),
      h2h_array: [],
      l5_array: [],
      h2h_avg: normalizedProp.h2h_avg || 0,
      l5_avg: normalizedProp.l5_avg || 0,
      h2h_score: 0,
      l5_score: 0,
      sample_size: normalizedProp.sample_size || 0,
      sorting_score: normalizedProp.sorting_score || 0,
      sorting_score_computed: normalizedProp.sorting_score,
      h2h_score_computed: normalizedProp.h2h_avg,
      l5_score_computed: normalizedProp.l5_avg,
      league: normalizedProp.league
    };
  };

  const handleAddProp = (normalizedProp: NormalizedProp) => {
    const legacyProp = convertToLegacyProp(normalizedProp);
    
    if (selectedProps.length < 4 && !selectedProps.find(p => p.prop_id === legacyProp.prop_id)) {
      setSelectedProps([...selectedProps, legacyProp]);
      setSearchQuery('');
      setShowDropdown(false);
    }
  };

  const handleRemoveProp = (propId: string) => {
    setSelectedProps(selectedProps.filter(p => p.prop_id !== propId));
  };

  const handleExport = () => {
    // Export functionality
  };

  const handleShare = () => {
    // Share functionality
  };

  // Clear selected props when leagues change
  React.useEffect(() => {
    setSelectedProps([]);
  }, [selectedLeagues]);

  const getExampleSearch = () => {
    if (selectedLeagues.includes('NBA')) return 'LeBron James';
    if (selectedLeagues.includes('NFL')) return 'Josh Allen';
    return 'player name';
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative z-10 container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading {leagueDisplay} props...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative z-10 container mx-auto p-6">
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">Error loading props: {error.message}</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-40 right-10 w-80 h-80 bg-blue-600 opacity-15 rounded-full blur-2xl animate-ping" />
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-slate-600 opacity-10 rounded-full blur-2xl animate-pulse transform -translate-x-1/2" />
      
      <div className="relative z-10 container mx-auto p-6 space-y-6">
        {/* League Selector */}
        <LeagueSelector
          selectedLeagues={selectedLeagues}
          onLeaguesChange={setSelectedLeagues}
        />

        {/* Header */}
        <div className="border-b border-slate-700 pb-6 glass-card p-6">
          <div className="flex items-center gap-4">
            <GitCompare className="h-12 w-12 text-blue-400" />
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Compare {leagueDisplay} Props
              </h1>
              <p className="text-xl text-slate-400 mt-2">
                Side-by-side analysis of up to 4 {leagueDisplay} props with detailed metrics
              </p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <Card className="glass-card border border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Select {leagueDisplay} Props
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={`Search by player name (e.g., '${getExampleSearch()}')`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(e.target.value.trim().length > 0);
                }}
                onFocus={() => setShowDropdown(searchQuery.trim().length > 0)}
                className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 h-12"
              />
              
              {/* Search Results Dropdown */}
              {showDropdown && hasResults && (
                <div className="absolute top-full left-0 right-0 mt-1 glass-card border border-slate-600 rounded-lg max-h-80 overflow-y-auto z-50">
                  {searchResults.map((playerGroup) => (
                    <div key={playerGroup.player} className="border-b border-slate-700 last:border-b-0">
                      <div className="p-3 bg-slate-800/50">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-blue-400" />
                          <span className="text-white font-medium">{playerGroup.player}</span>
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            {playerGroup.total_props} props
                          </Badge>
                        </div>
                        
                        {/* Show first few prop types */}
                        <div className="text-sm text-slate-400">
                          {Object.keys(playerGroup.prop_types).slice(0, 3).join(', ')}
                          {Object.keys(playerGroup.prop_types).length > 3 && '...'}
                        </div>
                      </div>
                      
                      {/* Individual props */}
                      {Object.entries(playerGroup.prop_types).map(([propType, oddTypes]) =>
                        Object.entries(oddTypes).map(([oddType, props]) =>
                          props.map((prop) => (
                            <div
                              key={prop.id}
                              className="p-3 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-white font-medium">{prop.prop_type}</span>
                                    <span className="text-slate-400">|</span>
                                    <span className="text-slate-300">{prop.team} vs {prop.opponent}</span>
                                    <span className="text-slate-400">|</span>
                                    <span className="text-white font-bold">{prop.line}</span>
                                    <Badge 
                                      variant={prop.odd_type === 'Demon' ? 'destructive' : prop.odd_type === 'Goblin' ? 'secondary' : 'default'}
                                      className={
                                        prop.odd_type === 'Demon' ? 'bg-red-600 hover:bg-red-700' :
                                        prop.odd_type === 'Goblin' ? 'bg-green-600 hover:bg-green-700' :
                                        'bg-blue-600 hover:bg-blue-700'
                                      }
                                    >
                                      {prop.odd_type}
                                    </Badge>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleAddProp(prop)}
                                  disabled={selectedProps.length >= 4 || selectedProps.some(p => p.prop_id === prop.id)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Add to Compare
                                </Button>
                              </div>
                            </div>
                          ))
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* No Results */}
              {showDropdown && !hasResults && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 glass-card border border-slate-600 rounded-lg p-4 z-50">
                  <p className="text-slate-400 text-center">No {leagueDisplay} props found</p>
                </div>
              )}
            </div>

            {/* Selected Props Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, index) => {
                const prop = selectedProps[index];
                return (
                  <div
                    key={index}
                    className={`glass-card border border-slate-600 rounded-lg p-4 h-32 flex items-center justify-center ${
                      prop ? 'bg-slate-800/30' : 'bg-slate-800/10 border-dashed'
                    }`}
                  >
                    {prop ? (
                      <div className="text-center w-full">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-white truncate">{prop.player_name}</div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveProp(prop.prop_id)}
                            className="h-6 w-6 p-0 hover:bg-red-600/20"
                          >
                            <X className="h-3 w-3 text-red-400" />
                          </Button>
                        </div>
                        <div className="text-xs text-slate-400">{prop.team} vs {prop.against_team}</div>
                        <div className="text-sm text-blue-400 mt-1">{prop.stat_type}</div>
                        <div className="text-lg font-bold text-white">{prop.line_score}</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-slate-500 text-sm">Slot {index + 1}</div>
                        <div className="text-slate-600 text-xs mt-1">Select a {leagueDisplay} prop to compare</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            {selectedProps.length > 1 && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleExport} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={handleShare} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparison Table */}
        {selectedProps.length > 1 && (
          <>
            {/* Comparison Summary */}
            <Card className="glass-card border border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <GitCompare className="h-5 w-5 text-blue-400" />
                  Comparison Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border border-slate-700 rounded-lg bg-slate-800/50">
                    <div className="text-2xl font-bold text-blue-400">{selectedProps.length}</div>
                    <div className="text-sm text-slate-400">Props Selected</div>
                  </div>
                  <div className="text-center p-4 border border-slate-700 rounded-lg bg-slate-800/50">
                    <div className="text-2xl font-bold text-green-400">
                      {selectedProps.filter(p => p.sorting_score_computed && p.sorting_score_computed >= 0.75).length}
                    </div>
                    <div className="text-sm text-slate-400">High-Score Props</div>
                  </div>
                  <div className="text-center p-4 border border-slate-700 rounded-lg bg-slate-800/50">
                    <div className="text-2xl font-bold text-purple-400">
                      {Math.max(...selectedProps.map(p => p.sorting_score_computed || p.sorting_score)).toFixed(3)}
                    </div>
                    <div className="text-sm text-slate-400">Best Score</div>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="mt-4 pt-4 border-t border-slate-600">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-slate-400">Avg Line Score</div>
                      <div className="text-white font-semibold">
                        {(selectedProps.reduce((sum, p) => sum + p.line_score, 0) / selectedProps.length).toFixed(1)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400">Avg Prop Score</div>
                      <div className="text-white font-semibold">
                        {(selectedProps.reduce((sum, p) => sum + (p.sorting_score_computed || p.sorting_score), 0) / selectedProps.length).toFixed(3)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400">Total Games</div>
                      <div className="text-white font-semibold">
                        {selectedProps.reduce((sum, p) => sum + (p.h2h_array?.length || 0) + (p.l5_array?.length || 0), 0)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400">Stat Types</div>
                      <div className="text-white font-semibold">
                        {new Set(selectedProps.map(p => p.stat_type)).size}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ComparisonTable props={selectedProps} />
          </>
        )}
      </div>
    </div>
  );
};
