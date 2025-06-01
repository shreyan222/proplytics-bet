
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PropsTable } from './PropsTable';
import { PropsFilters } from './PropsFilters';
import { usePropsData } from '@/hooks/usePropsData';
import { useFilteredProps } from '@/hooks/useFilteredProps';
import { Activity, RefreshCw, BarChart3, TrendingUp } from 'lucide-react';
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
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a1d2e] via-[#0f1419] to-[#1a1d2e]">
        {/* Animated background elements */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#00ff88] opacity-20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-10 w-80 h-80 bg-[#00cc6a] opacity-15 rounded-full blur-2xl animate-ping" />
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-blue-500 opacity-10 rounded-full blur-2xl animate-pulse transform -translate-x-1/2" />
        
        <div className="relative z-10 container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="relative">
                <img 
                  src="/lovable-uploads/402b1e50-6b1e-40ae-abbb-0c98816bea46.png" 
                  alt="Loading" 
                  className="h-12 w-12 mx-auto mb-4 animate-spin"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] opacity-50 rounded-full blur-md animate-pulse" />
              </div>
              <p className="text-white/80 text-lg">Loading props data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a1d2e] via-[#0f1419] to-[#1a1d2e]">
        <div className="relative z-10 container mx-auto p-6">
          <Card className="bg-white/5 backdrop-blur-xl border border-red-500/30 shadow-2xl">
            <CardContent className="text-center py-8">
              <p className="text-red-400">Error loading data: {error.message}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const propCounts = {
    standard: props.filter(p => p.odds_type === 'standard').length,
    demon: props.filter(p => p.odds_type === 'demon').length,
    goblin: props.filter(p => p.odds_type === 'goblin').length,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a1d2e] via-[#0f1419] to-[#1a1d2e]">
      {/* Enhanced animated background shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#00ff88] opacity-20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-40 right-10 w-80 h-80 bg-[#00cc6a] opacity-15 rounded-full blur-2xl animate-ping" />
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-blue-500 opacity-10 rounded-full blur-2xl animate-pulse transform -translate-x-1/2" />
      <div className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-r from-[#00ff88] to-blue-400 opacity-10 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '3s' }} />
      
      {/* Floating geometric patterns */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/3 w-32 h-32 border border-[#00ff88] rounded-full animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 border border-blue-400 rotate-45 animate-pulse" />
      </div>

      {/* Content container with enhanced frosted effect */}
      <div className="relative z-10 container mx-auto p-6 space-y-6">
        
        {/* Enhanced Header */}
        <div className="border-b border-white/10 pb-6 bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/402b1e50-6b1e-40ae-abbb-0c98816bea46.png" 
                alt="Proplytics Logo" 
                className="w-12 h-12"
              />
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  NBA Props Dashboard
                </h1>
                <p className="text-xl text-white/60 mt-2">
                  Professional prop analysis and real-time tracking
                </p>
                <div className="flex items-center gap-2 mt-3 text-sm text-white/50">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-[#1a1d2e] border-none px-4 py-2 font-semibold">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { 
              label: 'Total Props', 
              value: props.length, 
              icon: <BarChart3 className="h-8 w-8 text-[#00ff88]" />,
              gradient: 'from-[#00ff88]/20 to-[#00cc6a]/20',
              border: 'border-[#00ff88]/30'
            },
            { 
              label: 'Standard', 
              value: propCounts.standard, 
              icon: <TrendingUp className="h-6 w-6 text-blue-400" />,
              gradient: 'from-blue-500/20 to-blue-600/20',
              border: 'border-blue-500/30'
            },
            { 
              label: 'Demon', 
              value: propCounts.demon, 
              icon: <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-xs font-bold text-white">D</div>,
              gradient: 'from-red-500/20 to-red-600/20',
              border: 'border-red-500/30'
            },
            { 
              label: 'Goblin', 
              value: propCounts.goblin, 
              icon: <div className="w-6 h-6 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] rounded-full flex items-center justify-center text-xs font-bold text-[#1a1d2e]">G</div>,
              gradient: 'from-[#00ff88]/20 to-[#00cc6a]/20',
              border: 'border-[#00ff88]/30'
            }
          ].map(({ label, value, icon, gradient, border }) => (
            <Card key={label} className={`bg-gradient-to-br ${gradient} backdrop-blur-xl border ${border} shadow-2xl rounded-2xl hover:scale-105 transition-all duration-300 group`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/70">{label}</p>
                    <p className="text-3xl font-bold text-white mt-1">{value}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors">
                    {icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Props Table & Filters */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 space-y-6">
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
