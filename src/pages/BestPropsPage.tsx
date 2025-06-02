import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, Search, Filter, RefreshCw, Star, Target, BarChart3 } from 'lucide-react';
import { LeagueSelector } from '@/components/LeagueSelector';
import { PropsTable } from '@/components/PropsTable';
import { getPropsForLeague } from '@/utils/multiLeagueSampleData';
import { Prop } from '@/types/nba';

export const BestPropsPage: React.FC = () => {
  const [selectedLeague, setSelectedLeague] = useState<'NBA' | 'NFL' | 'MLB'>('NBA');
  const props = getPropsForLeague(selectedLeague);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [selectedStatType, setSelectedStatType] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Filter and sort props by odds type and score
  const { standardProps, demonProps, goblinProps } = useMemo(() => {
    const filterProps = (props: Prop[], oddsType: 'standard' | 'demon' | 'goblin') => {
      return props
        .filter(prop => prop.odds_type === oddsType)
        .filter(prop => {
          const matchesSearch = searchQuery === '' || 
            prop.player_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prop.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prop.stat_type.toLowerCase().includes(searchQuery.toLowerCase());
          
          const matchesTeam = selectedTeam === 'all' || prop.team === selectedTeam;
          const matchesPosition = selectedPosition === 'all' || prop.position === selectedPosition;
          const matchesStatType = selectedStatType === 'all' || prop.stat_type === selectedStatType;
          const matchesMinScore = prop.sorting_score >= minScore;
          
          return matchesSearch && matchesTeam && matchesPosition && matchesStatType && matchesMinScore;
        })
        .sort((a, b) => b.sorting_score - a.sorting_score);
    };

    return {
      standardProps: filterProps(props, 'standard'),
      demonProps: filterProps(props, 'demon'),
      goblinProps: filterProps(props, 'goblin'),
    };
  }, [props, searchQuery, selectedTeam, selectedPosition, selectedStatType, minScore]);

  const handleRefresh = () => {
    console.log(`Refreshing ${selectedLeague} props data...`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* League Selector */}
      <LeagueSelector
        selectedLeague={selectedLeague}
        onLeagueChange={setSelectedLeague}
      />

      {/* Header */}
      <div className="border-b border-slate-700 pb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3 text-white">
              <Trophy className="h-10 w-10 text-yellow-500" />
              Top {selectedLeague} Props
            </h1>
            <p className="text-xl text-slate-400 mt-2">
              Top-rated {selectedLeague} prop recommendations based on advanced analytics
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <TrendingUp className="h-4 w-4" />
                Updated: {new Date().toLocaleTimeString()}
              </div>
              <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                Live
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
                <p className="text-sm font-medium text-slate-400">Total Props</p>
                <p className="text-3xl font-bold text-purple-400">{props.length}</p>
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
            
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="LAL">Lakers</SelectItem>
                <SelectItem value="GSW">Warriors</SelectItem>
                <SelectItem value="BOS">Celtics</SelectItem>
                <SelectItem value="MIL">Bucks</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger>
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="PG">Point Guard</SelectItem>
                <SelectItem value="SG">Shooting Guard</SelectItem>
                <SelectItem value="SF">Small Forward</SelectItem>
                <SelectItem value="PF">Power Forward</SelectItem>
                <SelectItem value="C">Center</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatType} onValueChange={setSelectedStatType}>
              <SelectTrigger>
                <SelectValue placeholder="Stat Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stats</SelectItem>
                <SelectItem value="Points">Points</SelectItem>
                <SelectItem value="Rebounds">Rebounds</SelectItem>
                <SelectItem value="Assists">Assists</SelectItem>
                <SelectItem value="3-Pointers Made">3-Pointers</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Min Score"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
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
              <CardTitle className="text-blue-400">Standard {selectedLeague} Props</CardTitle>
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
              <CardTitle className="text-red-400">Demon {selectedLeague} Props</CardTitle>
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
              <CardTitle className="text-green-400">Goblin {selectedLeague} Props</CardTitle>
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
