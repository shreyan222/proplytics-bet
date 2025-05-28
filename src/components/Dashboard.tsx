
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PropsTable } from './PropsTable';
import { SeedDataButton } from './SeedDataButton';
import { PropFilters } from '@/types/nba';
import { BarChart3, Clock, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { usePropsData } from '@/hooks/usePropsData';
import { Skeleton } from '@/components/ui/skeleton';

export const Dashboard: React.FC = () => {
  const { data: props = [], isLoading, error } = usePropsData();
  const [filters, setFilters] = useState<PropFilters>({});

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl text-red-600">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Unable to load props data. Try seeding some sample data first.
            </p>
            <div className="flex justify-center">
              <SeedDataButton />
            </div>
            {error instanceof Error && (
              <p className="text-center text-sm text-muted-foreground">
                {error.message}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (props.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">No Props Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              No NBA props data found. Seed some sample data to get started.
            </p>
            <div className="flex justify-center">
              <SeedDataButton />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate prop counts by category based on scoring thresholds
  const propCounts = props.reduce((acc, prop) => {
    acc[prop.odds_type] = (acc[prop.odds_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate additional statistics
  const uniqueGames = new Set(props.map(p => p.game_id)).size;
  const uniquePlayers = new Set(props.map(p => p.player_id)).size;
  const avgSortingScore = props.length > 0 
    ? props.reduce((sum, p) => sum + p.sorting_score, 0) / props.length 
    : 0;
  const lastUpdate = new Date();

  return (
    <div className="space-y-6">
      {/* Header with Seed Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">NBA Props Dashboard</h2>
          <p className="text-muted-foreground">
            Advanced scoring algorithm analyzing {props.length} props across {uniqueGames} games
          </p>
        </div>
        <SeedDataButton />
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Standard Props</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propCounts.standard || 0}</div>
            <p className="text-xs text-muted-foreground">
              H2H Score ≥ 75%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demon Props</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propCounts.demon || 0}</div>
            <p className="text-xs text-muted-foreground">
              H2H Score ≥ 75%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goblin Props</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propCounts.goblin || 0}</div>
            <p className="text-xs text-muted-foreground">
              H2H Score ≥ 87.5%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSortingScore.toFixed(3)}</div>
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
