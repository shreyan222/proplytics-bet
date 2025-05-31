
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, Search, Filter, RefreshCw, Star, Target, BarChart3 } from 'lucide-react';
import { usePropsData } from '@/hooks/usePropsData';
import { useRealtime } from '@/hooks/useRealtime';
import { PropsTable } from '@/components/PropsTable';
import { Prop } from '@/types/nba';

export const BestPropsPage: React.FC = () => {
  const { data: props = [], isLoading, error, refetch } = usePropsData();
  const { isConnected, lastUpdate } = useRealtime();
  
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

  const handleRefresh = async () => {
    await refetch();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading best props...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-destructive">Error loading props data. Please try again.</p>
            <Button onClick={handleRefresh} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Trophy className="h-10 w-10 text-yellow-500" />
              Best Props
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Top-rated NBA prop recommendations based on advanced analytics
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                {lastUpdate ? `Updated: ${lastUpdate.toLocaleTimeString()}` : 'Loading updates...'}
              </div>
              <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
                {isConnected ? "Live" : "Offline"}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Standard Props</p>
                <p className="text-3xl font-bold text-blue-600">{standardProps.length}</p>
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-600">STD</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Demon Props</p>
                <p className="text-3xl font-bold text-red-600">{demonProps.length}</p>
              </div>
              <Badge className="bg-red-600 hover:bg-red-700">DMN</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Goblin Props</p>
                <p className="text-3xl font-bold text-green-600">{goblinProps.length}</p>
              </div>
              <Badge className="bg-green-600 hover:bg-green-700">GBL</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Props</p>
                <p className="text-3xl font-bold text-purple-600">{props.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search players, teams, stats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
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
            <label htmlFor="favorites-only" className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              Show favorites only
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Props Tables by Odds Type */}
      <Tabs defaultValue="standard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="standard" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Standard ({standardProps.length})
          </TabsTrigger>
          <TabsTrigger value="demon" className="flex items-center gap-2 text-red-600">
            <Target className="h-4 w-4" />
            Demon ({demonProps.length})
          </TabsTrigger>
          <TabsTrigger value="goblin" className="flex items-center gap-2 text-green-600">
            <Target className="h-4 w-4" />
            Goblin ({goblinProps.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standard">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Standard Props</CardTitle>
              <CardDescription>
                Regular odds props with standard scoring analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropsTable props={standardProps} viewMode="table" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demon">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Demon Props</CardTitle>
              <CardDescription>
                High-risk, high-reward props with premium analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropsTable props={demonProps} viewMode="table" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goblin">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Goblin Props</CardTitle>
              <CardDescription>
                Special value props with enhanced scoring opportunities
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
