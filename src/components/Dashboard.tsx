
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PropsTable } from './PropsTable';
import { PropsFilters } from './PropsFilters';
import { usePropsData } from '@/hooks/usePropsData';
import { useFilteredProps } from '@/hooks/useFilteredProps';
import { Activity, RefreshCw, BarChart3 } from 'lucide-react';
import { PropFilters } from '@/types/nba';

export const Dashboard: React.FC = () => {
  const { data: props = [], isLoading, error, refetch } = usePropsData();
  const [filters, setFilters] = useState<PropFilters>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter props based on search query and filters
  const searchFilteredProps = props.filter(prop => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      prop.player_name.toLowerCase().includes(query) ||
      prop.team.toLowerCase().includes(query) ||
      prop.stat_type.toLowerCase().includes(query)
    );
  });
  
  const filteredProps = useFilteredProps(searchFilteredProps, filters);

  const updateFilters = (newFilters: PropFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setLastUpdated(new Date());
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading props data...</p>
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
            <p className="text-destructive">Error loading data: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Count props by odds type for the header
  const propCounts = {
    standard: props.filter(p => p.odds_type === 'standard').length,
    demon: props.filter(p => p.odds_type === 'demon').length,
    goblin: props.filter(p => p.odds_type === 'goblin').length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Professional Header */}
      <div className="border-b pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">NBA Props Dashboard</h1>
            <p className="text-xl text-muted-foreground mt-2">
              Professional prop analysis and real-time tracking
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Props</p>
                <p className="text-3xl font-bold">{props.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Standard</p>
                <p className="text-3xl font-bold text-blue-600">{propCounts.standard}</p>
              </div>
              <Badge variant="outline" className="text-blue-600">STD</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Demon</p>
                <p className="text-3xl font-bold text-red-600">{propCounts.demon}</p>
              </div>
              <Badge className="bg-red-600 hover:bg-red-700">DMN</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Goblin</p>
                <p className="text-3xl font-bold text-green-600">{propCounts.goblin}</p>
              </div>
              <Badge className="bg-green-600 hover:bg-green-700">GBL</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Props Interface */}
      <div className="space-y-6">
        <PropsFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
          totalProps={props.length}
          filteredProps={filteredProps.length}
          onViewModeChange={setViewMode}
          viewMode={viewMode}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <PropsTable props={filteredProps} viewMode={viewMode} />
      </div>
    </div>
  );
};
