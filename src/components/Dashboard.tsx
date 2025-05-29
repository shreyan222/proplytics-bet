
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PropsTable } from './PropsTable';
import { PropsFilters } from './PropsFilters';
import { SeedDataButton } from './SeedDataButton';
import { NotificationCenter } from './NotificationCenter';
import { PropFilters } from '@/types/nba';
import { BarChart3, Clock, Target, TrendingUp, AlertCircle, Filter } from 'lucide-react';
import { usePropsData } from '@/hooks/usePropsData';
import { useFilteredProps } from '@/hooks/useFilteredProps';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export const Dashboard: React.FC = () => {
  const { data: props = [], isLoading, error } = usePropsData();
  const [filters, setFilters] = useState<PropFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const filteredProps = useFilteredProps(props, filters);

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

  // Calculate prop counts by category based on filtered data
  const filteredPropCounts = filteredProps.reduce((acc, prop) => {
    acc[prop.odds_type] = (acc[prop.odds_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate additional statistics from filtered data
  const uniqueGames = new Set(filteredProps.map(p => p.game_id)).size;
  const uniquePlayers = new Set(filteredProps.map(p => p.player_id)).size;
  const avgSortingScore = filteredProps.length > 0 
    ? filteredProps.reduce((sum, p) => sum + p.sorting_score, 0) / filteredProps.length 
    : 0;
  const lastUpdate = new Date();

  return (
    <div className="space-y-6">
      {/* Header with Seed Button and Notifications */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">NBA Props Dashboard</h2>
          <p className="text-muted-foreground">
            Advanced scoring algorithm analyzing {filteredProps.length} of {props.length} props across {uniqueGames} games
          </p>
        </div>
        <div className="flex items-center gap-2 relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <SeedDataButton />
          <NotificationCenter 
            isOpen={showNotifications} 
            onToggle={() => setShowNotifications(!showNotifications)} 
          />
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Standard Props</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredPropCounts.standard || 0}</div>
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
            <div className="text-2xl font-bold">{filteredPropCounts.demon || 0}</div>
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
            <div className="text-2xl font-bold">{filteredPropCounts.goblin || 0}</div>
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
              {uniquePlayers} players
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{lastUpdate.toLocaleTimeString()}</div>
            <p className="text-xs text-muted-foreground">
              Auto-refresh: 60s
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <PropsFilters
          filters={filters}
          onFiltersChange={setFilters}
          totalProps={props.length}
          filteredProps={filteredProps.length}
        />
      )}

      {/* Main Props Table */}
      <PropsTable props={filteredProps} />
    </div>
  );
};
