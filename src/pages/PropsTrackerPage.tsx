
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Activity, RefreshCw, Plus, Minus, Edit, Search, Download, Table, Grid3X3, Clock, Bell } from 'lucide-react';
import { TrackerStatsCards } from '@/components/TrackerStatsCards';
import { TrackerPropsTable } from '@/components/TrackerPropsTable';
import { LiveActivityFeed } from '@/components/LiveActivityFeed';
import { useTrackerData } from '@/hooks/useTrackerData';
import { useToast } from '@/hooks/use-toast';

export const PropsTrackerPage: React.FC = () => {
  const { data: trackerData, isLoading, refetch } = useTrackerData();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedStatType, setSelectedStatType] = useState<string>('all');
  const [selectedOddsType, setSelectedOddsType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshCountdown, setRefreshCountdown] = useState(300);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Auto-refresh countdown
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setRefreshCountdown(prev => {
        if (prev <= 1) {
          handleRefresh();
          return 300; // Reset to 5 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = async () => {
    await refetch();
    setLastUpdated(new Date());
    setRefreshCountdown(300);
    
    if (soundEnabled) {
      // Play notification sound (you'd implement actual sound here)
      console.log('🔔 Data refreshed');
    }

    toast({
      title: 'Data Updated',
      description: 'Props data has been refreshed successfully',
    });
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading tracker data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">NBA Props Tracker</h1>
            <p className="text-xl text-muted-foreground mt-2">
              Real-time prop monitoring and change detection
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              {autoRefresh && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4" />
                  Next refresh: {formatCountdown(refreshCountdown)}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <Switch
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
              <span className="text-sm">Sound</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <span className="text-sm">Auto-refresh</span>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Now
            </Button>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <TrackerStatsCards data={trackerData} />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Filters & Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by player name, team, or stat type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Teams</SelectItem>
                      <SelectItem value="LAL">Lakers</SelectItem>
                      <SelectItem value="GSW">Warriors</SelectItem>
                      <SelectItem value="BOS">Celtics</SelectItem>
                      <SelectItem value="MIL">Bucks</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedStatType} onValueChange={setSelectedStatType}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Stat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stats</SelectItem>
                      <SelectItem value="Points">Points</SelectItem>
                      <SelectItem value="Rebounds">Rebounds</SelectItem>
                      <SelectItem value="Assists">Assists</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedOddsType} onValueChange={setSelectedOddsType}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Odds" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Odds</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="demon">Demon</SelectItem>
                      <SelectItem value="goblin">Goblin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    <Table className="h-4 w-4 mr-2" />
                    Table
                  </Button>
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                  >
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Cards
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Tables */}
          <Tabs defaultValue="new" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Props ({trackerData?.new_props?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="removed" className="flex items-center gap-2">
                <Minus className="h-4 w-4" />
                Removed Props ({trackerData?.removed_props?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="modified" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Modified Props ({trackerData?.changed_props?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new">
              <TrackerPropsTable
                data={trackerData?.new_props || []}
                type="new"
                viewMode={viewMode}
                searchQuery={searchQuery}
                filters={{
                  team: selectedTeam,
                  statType: selectedStatType,
                  oddsType: selectedOddsType
                }}
              />
            </TabsContent>

            <TabsContent value="removed">
              <TrackerPropsTable
                data={trackerData?.removed_props || []}
                type="removed"
                viewMode={viewMode}
                searchQuery={searchQuery}
                filters={{
                  team: selectedTeam,
                  statType: selectedStatType,
                  oddsType: selectedOddsType
                }}
              />
            </TabsContent>

            <TabsContent value="modified">
              <TrackerPropsTable
                data={trackerData?.changed_props || []}
                type="modified"
                viewMode={viewMode}
                searchQuery={searchQuery}
                filters={{
                  team: selectedTeam,
                  statType: selectedStatType,
                  oddsType: selectedOddsType
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Activity Feed */}
        <div className="xl:col-span-1">
          <LiveActivityFeed activities={trackerData?.recent_activities || []} />
        </div>
      </div>
    </div>
  );
};
