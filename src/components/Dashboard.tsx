
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PropsTable } from './PropsTable';
import { PropsFilters } from './PropsFilters';
import { StatsGrid } from './StatsGrid';
import { NotificationCenter } from './NotificationCenter';
import { NotificationSettings } from './NotificationSettings';
import { ChangeHistoryTable } from './ChangeHistoryTable';
import { usePropsData } from '@/hooks/usePropsData';
import { useFilteredProps } from '@/hooks/useFilteredProps';
import { Users, BarChart3, Settings, Bell, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PropFilters } from '@/types/nba';

export const Dashboard: React.FC = () => {
  const { data: props = [], isLoading, error } = usePropsData();
  const [filters, setFilters] = useState<PropFilters>({});
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const filteredProps = useFilteredProps(props, filters);
  const navigate = useNavigate();

  const updateFilters = (newFilters: PropFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-500">Error loading data: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">NBA Props Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time prop analysis and tracking
          </p>
        </div>
        <div className="flex gap-2 relative">
          <Button variant="outline" onClick={() => navigate('/players')}>
            <Users className="h-4 w-4 mr-2" />
            Players
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

      {/* Stats Overview */}
      <StatsGrid props={filteredProps} isLoading={isLoading} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="props" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="props" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Props
          </TabsTrigger>
          <TabsTrigger value="players" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Players
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
