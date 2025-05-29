
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { PlayerPerformanceChart } from '@/components/PlayerPerformanceChart';
import { usePropsData } from '@/hooks/usePropsData';
import { Prop } from '@/types/nba';

export const PlayerDetail: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const { data: props = [], isLoading } = usePropsData();

  // Filter props for this player
  const playerProps = props.filter(prop => prop.player_id === playerId);
  const playerInfo = playerProps[0];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Loading player data...</div>
      </div>
    );
  }

  if (!playerInfo) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="text-center py-8">Player not found</div>
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
  }, {} as Record<string, Prop[]>);

  // Generate mock performance data for charts
  const generatePerformanceData = (props: Prop[]) => {
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
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Player Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{playerInfo.player_name}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{playerInfo.position}</Badge>
                <Badge variant="outline">{playerInfo.team}</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Props</p>
              <p className="text-2xl font-bold">{playerProps.length}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-muted-foreground">Avg H2H Score</p>
              <p className="text-xl font-semibold">{avgH2HScore.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingDown className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm text-muted-foreground">Avg L5 Score</p>
              <p className="text-xl font-semibold">{avgL5Score.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <p className="text-sm text-muted-foreground">Avg Final Score</p>
              <p className="text-xl font-semibold">{avgSortingScore.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="h2h">Head-to-Head</TabsTrigger>
          <TabsTrigger value="recent">Recent Form</TabsTrigger>
          <TabsTrigger value="props">All Props</TabsTrigger>
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
            <Card key={statType}>
              <CardHeader>
                <CardTitle>{statType} Props ({typeProps.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {typeProps.slice(0, 5).map((prop) => (
                    <div key={prop.prop_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">vs {prop.against_team}</p>
                        <p className="text-sm text-muted-foreground">
                          Line: {prop.line_score} | Score: {prop.sorting_score.toFixed(2)}
                        </p>
                      </div>
                      <Badge variant={prop.odds_type === 'demon' ? 'destructive' : prop.odds_type === 'goblin' ? 'default' : 'secondary'}>
                        {prop.odds_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
