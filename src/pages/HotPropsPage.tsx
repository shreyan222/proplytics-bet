
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Flame, Filter } from 'lucide-react';
import { LeagueSelector } from '@/components/LeagueSelector';
import { PropsFilters } from '@/components/PropsFilters';
import { getPropsForMultipleLeagues, getSelectedLeaguesDisplay } from '@/utils/multiLeagueUtils';
import { useFilteredProps } from '@/hooks/useFilteredProps';
import { Prop, PropFilters } from '@/types/nba';

interface HotProp extends Prop {
  streak_type: 'over' | 'under';
  streak_length: number;
  streak_games: number[];
}

const HotPropsPage = () => {
  const [selectedLeagues, setSelectedLeagues] = useState<('NBA' | 'NFL' | 'MLB')[]>(['NBA']);
  const [filters, setFilters] = useState<PropFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const leagueDisplay = getSelectedLeaguesDisplay(selectedLeagues);

  // Get props for selected leagues
  const allProps = getPropsForMultipleLeagues(selectedLeagues);

  // Clear filters when leagues change
  React.useEffect(() => {
    setFilters({});
    setSearchQuery('');
  }, [selectedLeagues]);

  // Filter hot props (3+ consecutive overs or unders)
  const hotProps = useMemo(() => {
    const hot: HotProp[] = [];
    
    allProps.forEach(prop => {
      if (!prop.l5_array || prop.l5_array.length < 3) return;
      
      // Check for over streaks (last 3+ games over the line)
      let overStreak = 0;
      let underStreak = 0;
      
      // Count consecutive overs from the most recent games
      for (let i = prop.l5_array.length - 1; i >= 0; i--) {
        if (prop.l5_array[i] > prop.line_score) {
          overStreak++;
          underStreak = 0;
        } else if (prop.l5_array[i] < prop.line_score) {
          underStreak++;
          overStreak = 0;
        } else {
          break; // Push (exactly hit the line) breaks the streak
        }
      }
      
      if (overStreak >= 3) {
        hot.push({
          ...prop,
          streak_type: 'over',
          streak_length: overStreak,
          streak_games: prop.l5_array.slice(-overStreak)
        });
      } else if (underStreak >= 3) {
        hot.push({
          ...prop,
          streak_type: 'under',
          streak_length: underStreak,
          streak_games: prop.l5_array.slice(-underStreak)
        });
      }
    });
    
    // Sort by streak length (longest streaks first)
    return hot.sort((a, b) => b.streak_length - a.streak_length);
  }, [allProps]);

  // Apply filters to hot props
  const filteredHotProps = useFilteredProps(hotProps, filters);

  // Apply search filter
  const searchFilteredProps = useMemo(() => {
    if (!searchQuery.trim()) return filteredHotProps;
    
    const query = searchQuery.toLowerCase();
    return filteredHotProps.filter(prop => 
      prop.player_name.toLowerCase().includes(query) ||
      prop.team.toLowerCase().includes(query) ||
      prop.stat_type.toLowerCase().includes(query)
    );
  }, [filteredHotProps, searchQuery]);

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const handleRefresh = () => {
    // Simulate refresh - in real app this would refetch data
    console.log(`Refreshing ${leagueDisplay} hot props data...`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Hot Props</h1>
              <p className="text-muted-foreground">
                Props with 3+ consecutive overs or unders - trending opportunities
              </p>
            </div>
          </div>

          {/* League Selector */}
          <LeagueSelector 
            selectedLeagues={selectedLeagues}
            onLeaguesChange={setSelectedLeagues}
            className="w-fit"
          />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{hotProps.length}</p>
                  <p className="text-sm text-muted-foreground">Total Hot Props</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {hotProps.filter(p => p.streak_type === 'over').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Over Streaks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {hotProps.filter(p => p.streak_type === 'under').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Under Streaks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Filter className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{searchFilteredProps.length}</p>
                  <p className="text-sm text-muted-foreground">Filtered Results</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <PropsFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={handleClearFilters}
          totalProps={hotProps.length}
          filteredProps={searchFilteredProps.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={handleRefresh}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedLeague={selectedLeagues[0] || 'NBA'}
        />

        {/* Hot Props Table */}
        {searchFilteredProps.length > 0 ? (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                {leagueDisplay} Hot Props - Trending Opportunities
              </CardTitle>
              <CardDescription>
                {leagueDisplay} props with 3+ consecutive overs or unders. Use these trends to identify potential opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Player</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Team</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Stat</th>
                      <th className="text-center p-4 font-medium text-muted-foreground">Line</th>
                      <th className="text-center p-4 font-medium text-muted-foreground">Streak</th>
                      <th className="text-center p-4 font-medium text-muted-foreground">Length</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Recent Games</th>
                      <th className="text-center p-4 font-medium text-muted-foreground">Odds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchFilteredProps.map((prop) => {
                      const hotProp = prop as HotProp;
                      return (
                        <tr key={prop.prop_id} className="border-b border-border hover:bg-muted/50">
                          <td className="p-4">
                            <div className="font-medium text-foreground">{prop.player_name}</div>
                            <div className="text-sm text-muted-foreground">{prop.position}</div>
                          </td>
                          <td className="p-4 text-foreground">{prop.team}</td>
                          <td className="p-4 text-foreground">{prop.stat_type}</td>
                          <td className="p-4 text-center">
                            <span className="text-lg font-bold text-primary">{prop.line_score}</span>
                          </td>
                          <td className="p-4 text-center">
                            <Badge 
                              variant={hotProp.streak_type === 'over' ? 'default' : 'destructive'}
                              className="font-medium"
                            >
                              {hotProp.streak_type === 'over' ? (
                                <>
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Over
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                  Under
                                </>
                              )}
                            </Badge>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-bold text-foreground">{hotProp.streak_length}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              {hotProp.streak_games.map((game, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className={`text-xs ${
                                    game > prop.line_score 
                                      ? 'border-green-500 text-green-500' 
                                      : 'border-red-500 text-red-500'
                                  }`}
                                >
                                  {game}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <Badge 
                              className={
                                prop.odds_type === 'demon' ? 'bg-red-600 hover:bg-red-700' :
                                prop.odds_type === 'goblin' ? 'bg-green-600 hover:bg-green-700' : 
                                'bg-blue-600 hover:bg-blue-700'
                              }
                            >
                              {prop.odds_type}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Flame className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Hot Props Found</h3>
              <p className="text-muted-foreground">
                No {leagueDisplay} props currently have 3+ consecutive overs or unders. Try adjusting your filters or check back later.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HotPropsPage;
