import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Activity, RefreshCw, Plus, Minus, Edit, Search, Download, Table, Grid3X3, Clock, Bell } from 'lucide-react';
import { LeagueSelector } from '@/components/LeagueSelector';
import { getPropsForLeague } from '@/utils/multiLeagueSampleData';

export const PropsTrackerPage: React.FC = () => {
  const [selectedLeague, setSelectedLeague] = useState<'NBA' | 'NFL' | 'MLB'>('NBA');
  const props = getPropsForLeague(selectedLeague);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedStatType, setSelectedStatType] = useState<string>('all');
  const [selectedOddsType, setSelectedOddsType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshCountdown, setRefreshCountdown] = useState(300);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Mock tracker data based on selected league
  const trackerData = {
    new_props: props.slice(0, 2),
    removed_props: props.slice(2, 3),
    changed_props: props.slice(3, 4),
    recent_activities: [
      { id: '1', type: 'new', message: `New ${selectedLeague} prop added`, timestamp: new Date() },
      { id: '2', type: 'changed', message: `${selectedLeague} prop line updated`, timestamp: new Date() },
    ]
  };

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

  const handleRefresh = () => {
    setLastUpdated(new Date());
    setRefreshCountdown(300);
    
    if (soundEnabled) {
      console.log('🔔 Data refreshed');
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* League Selector */}
      <LeagueSelector
        selectedLeague={selectedLeague}
        onLeagueChange={setSelectedLeague}
      />

      {/* Header */}
      <div className="border-b border-slate-700 pb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">{selectedLeague} Props Tracker</h1>
            <p className="text-xl text-slate-400 mt-2">
              Real-time {selectedLeague} prop monitoring and change detection
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="h-4 w-4" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              {autoRefresh && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <RefreshCw className="h-4 w-4" />
                  Next refresh: {formatCountdown(refreshCountdown)}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-white" />
              <Switch
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
              <span className="text-sm text-white">Sound</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-white" />
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <span className="text-sm text-white">Auto-refresh</span>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Now
            </Button>
            <Badge variant="outline" className="text-green-400 border-green-400">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">New Props</p>
                <p className="text-3xl font-bold text-green-400">{trackerData.new_props.length}</p>
              </div>
              <Plus className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Removed Props</p>
                <p className="text-3xl font-bold text-red-400">{trackerData.removed_props.length}</p>
              </div>
              <Minus className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Modified Props</p>
                <p className="text-3xl font-bold text-blue-400">{trackerData.changed_props.length}</p>
              </div>
              <Edit className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Props</p>
                <p className="text-3xl font-bold text-purple-400">{props.length}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Filters */}
          <Card className="glass-card border border-slate-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-white">Filters & Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search by player name, team, or stat type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                </div>
                
                {/* Keep existing filter controls but update styling */}
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
                    className={viewMode === 'table' ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
                  >
                    <Table className="h-4 w-4 mr-2" />
                    Table
                  </Button>
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className={viewMode === 'cards' ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
                  >
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Cards
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Tables */}
          <Tabs defaultValue="new" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
              <TabsTrigger value="new" className="flex items-center gap-2 data-[state=active]:bg-green-600">
                <Plus className="h-4 w-4" />
                New Props ({trackerData.new_props.length})
              </TabsTrigger>
              <TabsTrigger value="removed" className="flex items-center gap-2 data-[state=active]:bg-red-600">
                <Minus className="h-4 w-4" />
                Removed Props ({trackerData.removed_props.length})
              </TabsTrigger>
              <TabsTrigger value="modified" className="flex items-center gap-2 data-[state=active]:bg-blue-600">
                <Edit className="h-4 w-4" />
                Modified Props ({trackerData.changed_props.length})
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
          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Live Activity</CardTitle>
              <CardDescription className="text-slate-400">
                Recent {selectedLeague} prop changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trackerData.recent_activities.map((activity) => (
                  <div key={activity.id} className="p-3 rounded bg-slate-800/50 border border-slate-700">
                    <p className="text-sm text-white">{activity.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{activity.timestamp.toLocaleTimeString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
