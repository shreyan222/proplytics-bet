
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, TrendingDown, Target, User, RefreshCw } from 'lucide-react';
import { PlayerPerformanceChart } from '@/components/PlayerPerformanceChart';
import { usePropsData } from '@/hooks/usePropsData';

export const PlayerDetail: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  
  // Get all props from Supabase
  const { data: allProps = [], isLoading, error, refetch } = usePropsData();
  
  // Filter props for this player
  const playerProps = allProps.filter(prop => prop.player_id === playerId);
  const playerInfo = playerProps[0];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={() => navigate('/players')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Players
        </Button>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading player data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={() => navigate('/players')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Players
        </Button>
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">Error loading player: {error.message}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!playerInfo && playerId) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={() => navigate('/players')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Players
        </Button>
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">Player not found</p>
          <p className="text-sm text-muted-foreground mt-2">The player with ID "{playerId}" could not be found.</p>
        </div>
      </div>
    );
  }

  if (!playerInfo) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={() => navigate('/players')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Players
        </Button>
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">Loading player data...</p>
        </div>
      </div>
    );
  }

  // Calculate player statistics
  const avgH2HScore = playerProps.reduce((sum, prop) => sum + prop.h2h_score, 0) / playerProps.length;
  const avgL5Score = playerProps.reduce((sum, prop) => sum + prop.l5_score, 0) / playerProps.length;
  const avgSortingScore = playerProps.reduce((sum, prop) => sum + prop.sorting_score, 0) / playerProps.length;

  // Group props by stat type
  const propsByStatType = playerProps.reduce((acc, prop) => {
    if (!acc[prop.stat_type]) acc[prop.stat_type] = [];
    acc[prop.stat_type].push(prop);
    return acc;
  }, {} as Record<string, typeof playerProps>);

  // Generate mock performance data for charts
  const generatePerformanceData = (props: typeof playerProps) => {
    return props.slice(0, 10).map((prop, index) => ({
      date: new Date(Date.now() - (10 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      score: prop.sorting_score,
      result: Math.random() > 0.4 ? 'hit' : 'miss' as 'hit' | 'miss',
      statType: prop.stat_type,
      line: prop.line_score,
      actual: prop.line_score + (Math.random() - 0.5) * 4,
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/players')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Players
        </Button>
      </div>

      {/* Player Info Card */}
      <Card className="glass-card border border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                <User className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">{playerInfo.player_name}</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{playerInfo.position}</Badge>
                  <Badge variant="outline">{playerInfo.team}</Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Total Props</p>
              <p className="text-2xl font-bold text-white">{playerProps.length}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-slate-700 rounded-lg bg-slate-800/50">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-slate-400">Avg H2H Score</p>
              <p className="text-xl font-semibold text-white">{avgH2HScore.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 border border-slate-700 rounded-lg bg-slate-800/50">
              <TrendingDown className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm text-slate-400">Avg L5 Score</p>
              <p className="text-xl font-semibold text-white">{avgL5Score.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 border border-slate-700 rounded-lg bg-slate-800/50">
              <Target className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <p className="text-sm text-slate-400">Avg Final Score</p>
              <p className="text-xl font-semibold text-white">{avgSortingScore.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview" className="text-slate-300 data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="h2h" className="text-slate-300 data-[state=active]:text-white">Head-to-Head</TabsTrigger>
          <TabsTrigger value="recent" className="text-slate-300 data-[state=active]:text-white">Recent Form</TabsTrigger>
          <TabsTrigger value="props" className="text-slate-300 data-[state=active]:text-white">All Props</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PlayerPerformanceChart
              data={generatePerformanceData(playerProps)}
              title="Overall Performance Trend"
              type="line"
            />
            <PlayerPerformanceChart
              data={generatePerformanceData(playerProps)}
              title="Recent Performance vs Line"
              type="bar"
            />
          </div>
        </TabsContent>

        <TabsContent value="h2h" className="space-y-4">
          <PlayerPerformanceChart
            data={generatePerformanceData(playerProps)}
            title="Head-to-Head Performance History"
            type="line"
          />
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <PlayerPerformanceChart
            data={generatePerformanceData(playerProps.slice(0, 5))}
            title="Last 5 Games Performance"
            type="bar"
          />
        </TabsContent>

        <TabsContent value="props" className="space-y-4">
          {Object.entries(propsByStatType).map(([statType, typeProps]) => (
            <Card key={statType} className="glass-card border border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">{statType} Props ({typeProps.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {typeProps.map((prop) => (
                    <div key={prop.prop_id} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-800/30">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-white">vs {prop.against_team}</p>
                          <Badge variant={prop.odds_type === 'demon' ? 'destructive' : prop.odds_type === 'goblin' ? 'default' : 'secondary'}>
                            {prop.odds_type}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">Line:</span>
                            <div className="font-medium text-white">{prop.line_score}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Final Score:</span>
                            <div className="font-medium text-white">{prop.sorting_score.toFixed(2)}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">H2H Score:</span>
                            <div className="font-medium text-white">{prop.h2h_score.toFixed(2)}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">L5 Score:</span>
                            <div className="font-medium text-white">{prop.l5_score.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {typeProps.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      No {statType} props found for this player.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {Object.keys(propsByStatType).length === 0 && (
            <Card className="glass-card border border-slate-700">
              <CardContent className="text-center py-8">
                <p className="text-slate-400">No props found for this player.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
