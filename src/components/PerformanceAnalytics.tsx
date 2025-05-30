
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { usePerformanceAnalytics } from '@/hooks/usePerformanceAnalytics';
import { Prop } from '@/types/nba';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Award,
  Activity,
  PieChart
} from 'lucide-react';

interface PerformanceAnalyticsProps {
  props: Prop[];
}

export const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ props }) => {
  const analytics = usePerformanceAnalytics(props);

  if (analytics.totalProps === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available for analysis</p>
        </CardContent>
      </Card>
    );
  }

  const topStatTypes = Object.entries(analytics.statTypeDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const topTeams = Object.entries(analytics.teamDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Props</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProps}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Final Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageScores.sorting.toFixed(3)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Sample Size</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.sampleSizeAnalysis.average.toFixed(1)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goblin Props</CardTitle>
            <Award className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.categoryBreakdown.goblin}</div>
            <p className="text-xs text-muted-foreground">
              {((analytics.categoryBreakdown.goblin / analytics.totalProps) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Props by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">Standard</Badge>
                  <span className="text-sm">{analytics.categoryBreakdown.standard}</span>
                </div>
                <Progress 
                  value={(analytics.categoryBreakdown.standard / analytics.totalProps) * 100} 
                  className="w-20"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-800">Demon</Badge>
                  <span className="text-sm">{analytics.categoryBreakdown.demon}</span>
                </div>
                <Progress 
                  value={(analytics.categoryBreakdown.demon / analytics.totalProps) * 100} 
                  className="w-20"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800">Goblin</Badge>
                  <span className="text-sm">{analytics.categoryBreakdown.goblin}</span>
                </div>
                <Progress 
                  value={(analytics.categoryBreakdown.goblin / analytics.totalProps) * 100} 
                  className="w-20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.scoreDistribution.map((bucket, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{bucket.range}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={bucket.percentage} className="w-20" />
                    <span className="text-sm text-muted-foreground w-12">
                      {bucket.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Stat Types */}
        <Card>
          <CardHeader>
            <CardTitle>Most Common Stat Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topStatTypes.map(([statType, count]) => (
                <div key={statType} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{statType}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Teams */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Most Active Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topTeams.map(([team, count]) => (
                <div key={team} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{team}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Performers (by Final Score)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.topPerformers.map((prop, index) => (
              <div key={prop.prop_id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <div className="font-medium">{prop.player_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {prop.team} vs {prop.against_team} • {prop.stat_type} {prop.line_score}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{prop.sorting_score.toFixed(3)}</div>
                  <Badge className={
                    prop.odds_type === 'goblin' ? 'bg-red-100 text-red-800' :
                    prop.odds_type === 'demon' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }>
                    {prop.odds_type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
