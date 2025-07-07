import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingUp, TrendingDown, Target, Trophy, BarChart3, RefreshCw } from 'lucide-react';
import { LeagueSelector } from '@/components/LeagueSelector';
import { useMultiLeagueProps } from '@/utils/multiLeagueUtils';

export const RecapPage: React.FC = () => {
  const [selectedLeagues, setSelectedLeagues] = useState<('NBA' | 'NFL')[]>(['NBA']);
  const { props, isLoading, error, refetch, leagueDisplay } = useMultiLeagueProps(selectedLeagues);

  // Mock data for demonstration - in a real app, this would come from your backend
  const mockRecapData = {
    totalProps: props.length,
    hitRate: 68.5,
    totalWinnings: 2450.75,
    bestPerformer: props.length > 0 ? props[0] : null,
    worstPerformer: props.length > 0 ? props[props.length - 1] : null,
    dailyStats: [
      { date: '2024-01-15', hits: 8, misses: 4, winnings: 245.50 },
      { date: '2024-01-14', hits: 6, misses: 6, winnings: 125.25 },
      { date: '2024-01-13', hits: 9, misses: 3, winnings: 380.75 },
      { date: '2024-01-12', hits: 7, misses: 5, winnings: 195.00 },
      { date: '2024-01-11', hits: 10, misses: 2, winnings: 425.25 },
    ]
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading {leagueDisplay} recap...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">Error loading recap: {error.message}</p>
          <Button onClick={() => refetch()} variant="outline">
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3 text-white">
              <Calendar className="h-10 w-10 text-blue-500" />
              {leagueDisplay} Performance Recap
            </h1>
            <p className="text-xl text-slate-400 mt-2">
              Your {leagueDisplay} prop betting performance summary and insights
            </p>
          </div>
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            Last 7 Days
          </Badge>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Props</p>
                <p className="text-3xl font-bold text-white">{mockRecapData.totalProps}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Hit Rate</p>
                <p className="text-3xl font-bold text-green-400">{mockRecapData.hitRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Winnings</p>
                <p className="text-3xl font-bold text-yellow-400">${mockRecapData.totalWinnings}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Avg Per Day</p>
                <p className="text-3xl font-bold text-purple-400">${(mockRecapData.totalWinnings / 7).toFixed(2)}</p>
              </div>
              <Target className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Details */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="daily" className="data-[state=active]:bg-green-600">
            Daily Breakdown
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-purple-600">
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Performer */}
            {mockRecapData.bestPerformer && (
              <Card className="glass-card border border-slate-700">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Best Performer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Player:</span>
                      <span className="text-white font-medium">{mockRecapData.bestPerformer.player_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Stat:</span>
                      <span className="text-white">{mockRecapData.bestPerformer.stat_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Line:</span>
                      <span className="text-white font-bold">{mockRecapData.bestPerformer.line_score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Score:</span>
                      <span className="text-green-400 font-bold">{mockRecapData.bestPerformer.sorting_score.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Worst Performer */}
            {mockRecapData.worstPerformer && (
              <Card className="glass-card border border-slate-700">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Needs Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Player:</span>
                      <span className="text-white font-medium">{mockRecapData.worstPerformer.player_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Stat:</span>
                      <span className="text-white">{mockRecapData.worstPerformer.stat_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Line:</span>
                      <span className="text-white font-bold">{mockRecapData.worstPerformer.line_score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Score:</span>
                      <span className="text-red-400 font-bold">{mockRecapData.worstPerformer.sorting_score.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Daily Performance Breakdown</CardTitle>
              <CardDescription className="text-slate-400">
                Your {leagueDisplay} prop performance over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecapData.dailyStats.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-800/30">
                    <div className="flex items-center gap-4">
                      <div className="text-white font-medium">{day.date}</div>
                      <div className="flex gap-2">
                        <Badge variant="default" className="bg-green-600">
                          {day.hits} Hits
                        </Badge>
                        <Badge variant="destructive" className="bg-red-600">
                          {day.misses} Misses
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold">${day.winnings}</div>
                      <div className="text-sm text-slate-400">
                        {((day.hits / (day.hits + day.misses)) * 100).toFixed(1)}% hit rate
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border border-slate-700">
              <CardHeader>
                <CardTitle className="text-blue-400">Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border border-blue-500/30 rounded-lg bg-blue-500/10">
                    <p className="text-sm text-blue-300">
                      Your {leagueDisplay} prop hit rate is above average at {mockRecapData.hitRate}%
                    </p>
                  </div>
                  <div className="p-3 border border-green-500/30 rounded-lg bg-green-500/10">
                    <p className="text-sm text-green-300">
                      Best performing stat type: Points (72% hit rate)
                    </p>
                  </div>
                  <div className="p-3 border border-yellow-500/30 rounded-lg bg-yellow-500/10">
                    <p className="text-sm text-yellow-300">
                      Most profitable day: {mockRecapData.dailyStats[2].date} (${mockRecapData.dailyStats[2].winnings})
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border border-slate-700">
              <CardHeader>
                <CardTitle className="text-purple-400">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border border-purple-500/30 rounded-lg bg-purple-500/10">
                    <p className="text-sm text-purple-300">
                      Focus on Goblin props for more consistent returns
                    </p>
                  </div>
                  <div className="p-3 border border-orange-500/30 rounded-lg bg-orange-500/10">
                    <p className="text-sm text-orange-300">
                      Consider reducing exposure to high-risk Demon props
                    </p>
                  </div>
                  <div className="p-3 border border-cyan-500/30 rounded-lg bg-cyan-500/10">
                    <p className="text-sm text-cyan-300">
                      Your rebounds props have a 78% hit rate - consider increasing volume
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
