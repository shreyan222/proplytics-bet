import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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

  const updateFilters = (newFilters: PropFilters) => setFilters(newFilters);
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

  const propCounts = {
    standard: props.filter(p => p.odds_type === 'standard').length,
    demon: props.filter(p => p.odds_type === 'demon').length,
    goblin: props.filter(p => p.odds_type === 'goblin').length,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">

      {/* Animated blurred background shapes */}
      <div className="absolute -top-20 -left-32 w-96 h-96 bg-purple-600 opacity-30 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-pink-500 opacity-20 rounded-full blur-2xl animate-ping z-0" />
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-blue-500 opacity-20 rounded-full blur-2xl animate-pulse z-0 transform -translate-x-1/2" />

      {/* Content container with frosted effect */}
      <div className="relative z-10 container mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="border-b pb-6 bg-white/10 dark:bg-white/20 backdrop-blur-md rounded-2xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">NBA Props Dashboard</h1>
              <p className="text-xl text-muted-foreground mt-2">
                Professional prop analysis and real-time tracking
              </p>
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Props', value: props.length, color: '', icon: <BarChart3 className="h-8 w-8 text-primary" /> },
            { label: 'Standard', value: propCounts.standard, color: 'text-blue-600', tag: 'Standard' },
            { label: 'Demon', value: propCounts.demon, color: 'text-red-600', tag: 'Demon', badgeClass: 'bg-red-600 hover:bg-red-700' },
            { label: 'Goblin', value: propCounts.goblin, color: 'text-green-600', tag: 'Goblin', badgeClass: 'bg-green-600 hover:bg-green-700' }
          ].map(({ label, value, color, icon, tag, badgeClass }) => (
            <Card key={label} className="bg-white/5 dark:bg-white/10 backdrop-blur-md border border-white/10 shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className={`text-3xl font-bold ${color}`}>{value}</p>
                  </div>
                  {icon ? icon : (
                    <Badge className={badgeClass}>{tag}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Props Table & Filters */}
        <div className="bg-white/5 dark:bg-white/10 backdrop-blur-md border border-white/10 shadow-lg rounded-2xl p-6 space-y-6">
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
    </div>
  );
};
