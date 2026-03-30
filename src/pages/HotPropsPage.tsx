import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, TrendingUp, Search, Filter, RefreshCw, Star, Target, BarChart3 } from 'lucide-react';
import { LeagueSelector } from '@/components/LeagueSelector';
import { PropsTable } from '@/components/PropsTable';
import { useMultiLeagueProps } from '@/utils/multiLeagueUtils';
import { Prop } from '@/types/nba';

const HotPropsPage: React.FC = () => {
  const [selectedLeagues, setSelectedLeagues] = useState<('NBA' | 'NFL')[]>(['NBA']);
  const { props, isLoading, error, refetch, leagueDisplay, locked } = useMultiLeagueProps(selectedLeagues);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [selectedStatType, setSelectedStatType] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Get unique teams, positions, and stat types from all selected leagues
  const teams = [...new Set(props.map(prop => prop.team))].sort();
  const positions = [...new Set(props.map(prop => prop.position))].filter(Boolean).sort();
  const statTypes = [...new Set(props.map(prop => prop.stat_type))].sort();

  // Filter and sort props by odds type and score
  const filterProps = (props: Prop[], oddsType: 'standard' | 'demon' | 'goblin') => {
    return props
      .filter(prop => prop.odds_type === oddsType)
      .filter(prop => {
        // Only show props that have gone over their line in all 5 of their last 5 games
        if (!prop.l5_array || prop.l5_array.length !== 5) {
          return false;
        }
        
        // Check if all 5 games went over the line
        const allGamesOverLine = prop.l5_array.every(score => score > prop.line_score);
        if (!allGamesOverLine) {
          return false;
        }
        
        const matchesSearch = searchQuery === '' || 
          prop.player_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prop.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prop.stat_type.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (locked) return matchesSearch;

        const matchesTeam = selectedTeam === 'all' || prop.team === selectedTeam;
        const matchesPosition = selectedPosition === 'all' || prop.position === selectedPosition;
        const matchesStatType = selectedStatType === 'all' || prop.stat_type === selectedStatType;
        const matchesMinScore = prop.sorting_score >= minScore;
        
        return matchesSearch && matchesTeam && matchesPosition && matchesStatType && matchesMinScore;
      })
      .sort((a, b) => b.sorting_score - a.sorting_score);
  };

  const standardProps = filterProps(props, 'standard');
  const demonProps = filterProps(props, 'demon');
  const goblinProps = filterProps(props, 'goblin');

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading {leagueDisplay} props...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">Error loading props: {error.message}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* League Selector */}
      <LeagueSelector
        selectedLeagues={selectedLeagues}
        onLeaguesChange={setSelectedLeagues}
      />

      {/* Header */}
      <div className="border-b border-slate-700 pb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3 text-white">
              <Flame className="h-10 w-10 text-orange-500" />
              Hot {leagueDisplay} Props
            </h1>
            <p className="text-xl text-slate-400 mt-2">
              Hottest {leagueDisplay} prop recommendations based on recent performance
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Showing only props that have gone over their line in all 5 of their last 5 games
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <TrendingUp className="h-4 w-4" />
                Updated: {new Date().toLocaleTimeString()}
              </div>
              <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                Live Data
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button onClick={handleRefresh} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 glass-card border border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Standard Props</p>
                <p className="text-3xl font-bold text-blue-400">{standardProps.length}</p>
              </div>
              <Badge variant="outline" className="text-blue-400 border-blue-400">STD</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500 glass-card border border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Demon Props</p>
                <p className="text-3xl font-bold text-red-400">{demonProps.length}</p>
              </div>
              <Badge className="bg-red-600 hover:bg-red-700">DMN</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 glass-card border border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Goblin Props</p>
                <p className="text-3xl font-bold text-green-400">{goblinProps.length}</p>
              </div>
              <Badge className="bg-green-600 hover:bg-green-700">GBL</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500 glass-card border border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Hot Props</p>
                <p className="text-3xl font-bold text-purple-400">{goblinProps.length+demonProps.length+standardProps.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card border border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {locked && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
              Subscribe to view all props and unlock filters.
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search players, teams, stats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <Select disabled={locked} value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select disabled={locked} value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger>
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {positions.map(position => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select disabled={locked} value={selectedStatType} onValueChange={setSelectedStatType}>
              <SelectTrigger>
                <SelectValue placeholder="Stat Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stats</SelectItem>
                {statTypes.map(statType => (
                  <SelectItem key={statType} value={statType}>
                    {statType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Min Score"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                disabled={locked}
                min="0"
                max="100"
                step="1"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="favorites-only"
              checked={showFavoritesOnly}
              onCheckedChange={setShowFavoritesOnly}
              disabled={locked}
            />
            <label htmlFor="favorites-only" className="text-sm font-medium flex items-center gap-2 text-white">
              <Star className="h-4 w-4" />
              Show favorites only
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Props Tables by Odds Type */}
      <Tabs defaultValue="standard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
          <TabsTrigger value="standard" className="flex items-center gap-2 data-[state=active]:bg-blue-600">
            <Target className="h-4 w-4" />
            Standard ({standardProps.length})
          </TabsTrigger>
          <TabsTrigger value="demon" className="flex items-center gap-2 data-[state=active]:bg-red-600">
            <Target className="h-4 w-4" />
            Demon ({demonProps.length})
          </TabsTrigger>
          <TabsTrigger value="goblin" className="flex items-center gap-2 data-[state=active]:bg-green-600">
            <Target className="h-4 w-4" />
            Goblin ({goblinProps.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standard">
          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="text-blue-400">Standard {leagueDisplay} Props</CardTitle>
              <CardDescription className="text-slate-400">
                Regular odds props with standard scoring analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropsTable props={standardProps} viewMode="table" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demon">
          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="text-red-400">Demon {leagueDisplay} Props</CardTitle>
              <CardDescription className="text-slate-400">
                High-risk, high-reward props with advanced analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropsTable props={demonProps} viewMode="table" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goblin">
          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="text-green-400">Goblin {leagueDisplay} Props</CardTitle>
              <CardDescription className="text-slate-400">
                Low-risk, consistent props with reliable analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropsTable props={goblinProps} viewMode="table" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HotPropsPage;
