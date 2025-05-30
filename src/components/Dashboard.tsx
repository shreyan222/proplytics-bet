
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PropsTable } from './PropsTable';
import { PropsFilters } from './PropsFilters';
import { StatsGrid } from './StatsGrid';
import { NotificationCenter } from './NotificationCenter';
import { NotificationSettings } from './NotificationSettings';
import { ChangeHistoryTable } from './ChangeHistoryTable';
import { RealtimeStats } from './RealtimeStats';
import { LiveNotifications } from './LiveNotifications';
import { usePropsData } from '@/hooks/usePropsData';
import { useFilteredProps } from '@/hooks/useFilteredProps';
import { Users, BarChart3, Settings, Bell, History, Activity, Zap, TrendingUp, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PropFilters } from '@/types/nba';

export const Dashboard: React.FC = () => {
  const { data: props = [], isLoading, error, refetch } = usePropsData();
  const [filters, setFilters] = useState<PropFilters>({});
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const filteredProps = useFilteredProps(props, filters);
  const navigate = useNavigate();

  const updateFilters = (newFilters: PropFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
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
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, []);

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
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">NBA Props Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time prop analysis and tracking
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={isRefreshing ? 'auto-refresh-indicator' : ''}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/players')}>
            <Users className="h-4 w-4 mr-2" />
            Players
          </Button>
          <Button variant="outline" onClick={() => navigate('/analytics')}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline" onClick={() => navigate('/settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <NotificationCenter 
            isOpen={isNotificationOpen} 
            onToggle={() => setIsNotificationOpen(!isNotificationOpen)} 
          />
        </div>
      </div>

      {/* Props Count Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Props</p>
                <p className="text-2xl font-bold">{props.length}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Standard</p>
                <p className="text-2xl font-bold text-blue-600">{propCounts.standard}</p>
              </div>
              <Badge className="odds-standard">STD</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Demon</p>
                <p className="text-2xl font-bold text-red-600">{propCounts.demon}</p>
              </div>
              <Badge className="odds-demon">DMN</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Goblin</p>
                <p className="text-2xl font-bold text-green-600">{propCounts.goblin}</p>
              </div>
              <Badge className="odds-goblin">GBL</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Stats Overview */}
      <RealtimeStats />

      {/* Main Content Tabs */}
      <Tabs defaultValue="props" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="props" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Props
          </TabsTrigger>
          <TabsTrigger value="players" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Players
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-time
          </TabsTrigger>
          <TabsTrigger value="live-notifications" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Live
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="props" className="space-y-4">
          <PropsFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            totalProps={props.length}
            filteredProps={filteredProps.length}
          />
          <PropsTable props={filteredProps} />
        </TabsContent>

        <TabsContent value="players" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Player Analysis</CardTitle>
              <CardDescription>
                Deep dive into individual player performance and prop history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/players')} className="w-full">
                <Users className="h-4 w-4 mr-2" />
                View All Players
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Real-time Overview
                </CardTitle>
                <CardDescription>
                  Live prop counts and active games monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Real-time statistics and connection status are displayed above.
                  This includes live prop counts by category, active games, and connection health.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  System performance and update frequency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Update Frequency:</span>
                    <span className="font-mono">2 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Source:</span>
                    <span className="font-mono">Supabase + Sample</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Latency:</span>
                    <span className="font-mono">&lt; 100ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="live-notifications" className="space-y-4">
          <LiveNotifications />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <ChangeHistoryTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};
