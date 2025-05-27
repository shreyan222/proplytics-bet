
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PropsTable } from './PropsTable';
import { Prop, PropFilters } from '@/types/nba';
import { BarChart3, Clock, Target, TrendingUp } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [props, setProps] = useState<Prop[]>([]);
  const [filters, setFilters] = useState<PropFilters>({});
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mock data for initial display - you'll replace this with real data
  useEffect(() => {
    // This would normally fetch from your API
    const mockProps: Prop[] = [
      {
        prop_id: '1',
        player_id: '1',
        player_name: 'Mikal Bridges',
        position: 'SG',
        team: 'NYK',
        against_team: 'MIA',
        stat_type: 'Pts+Rebs+Asts',
        line_score: 25.5,
        odds_type: 'standard',
        game_id: 'game1',
        start_time: '2025-01-27T19:00:00Z',
        h2h_array: [33, 35, 33, 41, 26, 17],
        l5_array: [12, 31, 26, 41, 28],
        h2h_avg: 30.83,
        l5_avg: 27.6,
        h2h_score: 0.833,
        l5_score: 0.8,
        sample_size: 6,
        sorting_score: 1.693,
      },
      {
        prop_id: '2',
        player_id: '2',
        player_name: 'Luka Doncic',
        position: 'PG',
        team: 'LAL',
        against_team: 'SAS',
        stat_type: 'Rebounds',
        line_score: 9.5,
        odds_type: 'standard',
        game_id: 'game2',
        start_time: '2025-01-27T21:00:00Z',
        h2h_array: [13, 12, 9, 10, 10, 6],
        l5_array: [7, 8, 12, 11, 11],
        h2h_avg: 10.0,
        l5_avg: 9.8,
        h2h_score: 0.667,
        l5_score: 0.6,
        sample_size: 6,
        sorting_score: 1.605,
      },
    ];
    setProps(mockProps);
  }, []);

  const propCounts = props.reduce((acc, prop) => {
    acc[prop.odds_type] = (acc[prop.odds_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueGames = new Set(props.map(p => p.game_id)).size;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Standard Props</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propCounts.standard || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demon Props</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propCounts.demon || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goblin Props</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propCounts.goblin || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Games</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueGames}</div>
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Props Table */}
      <PropsTable 
        props={props} 
        filters={filters} 
        onFiltersChange={setFilters} 
      />
    </div>
  );
};
