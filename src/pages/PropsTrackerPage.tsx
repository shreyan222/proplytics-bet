import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp, TrendingDown, Search, Filter, RefreshCw, Clock, AlertCircle, Wifi, WifiOff, Trash2 } from 'lucide-react';
import { LeagueSelector } from '@/components/LeagueSelector';
import { useMultiLeagueProps } from '@/utils/multiLeagueUtils';
import { Prop } from '@/types/nba';
import { usePropsRealtime, PropChange } from '@/hooks/usePropsRealtime';

export const PropsTrackerPage: React.FC = () => {
  const [selectedLeagues, setSelectedLeagues] = useState<('NBA' | 'NFL')[]>(['NBA']);
  const { props, isLoading, error, refetch, leagueDisplay } = useMultiLeagueProps(selectedLeagues);
  
  // Use our real-time hook to track changes
  const { 
    isConnected, 
    newProps, 
    changedProps, 
    removedProps, 
    lastUpdateTime, 
    clearChanges 
  } = usePropsRealtime();

  // UI state
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'changed' | 'removed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [selectedStatType, setSelectedStatType] = useState<string>('all');
  const [trackingFilter, setTrackingFilter] = useState<'all' | 'rising' | 'falling' | 'stable'>('all');

  // Get unique teams, positions, and stat types
  const teams = [...new Set(props.map(prop => prop.team))].sort();
  const positions = [...new Set(props.map(prop => prop.position))].filter(Boolean).sort();
  const statTypes = [...new Set(props.map(prop => prop.stat_type))].sort();

  // Mock tracking data - in real app this would come from historical data
  const getTrackingData = (prop: Prop) => {
    const trend = Math.random() > 0.33 ? (Math.random() > 0.5 ? 'rising' : 'falling') : 'stable';
    const changePercent = trend === 'stable' ? 0 : (Math.random() * 20 - 10);
    const lastUpdate = new Date(Date.now() - Math.random() * 3600000); // Random time in last hour
    
    return {
      trend,
      changePercent: Number(changePercent.toFixed(1)),
      lastUpdate,
      alerts: Math.random() > 0.8 ? ['Line moved significantly'] : [],
    };
  };

  // Filter props based on search and filters
  const filteredProps = props.filter(prop => {
    const trackingData = getTrackingData(prop);
    
    const matchesSearch = searchQuery === '' || 
      prop.player_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.stat_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTeam = selectedTeam === 'all' || prop.team === selectedTeam;
    const matchesPosition = selectedPosition === 'all' || prop.position === selectedPosition;
    const matchesStatType = selectedStatType === 'all' || prop.stat_type === selectedStatType;
    const matchesTracking = trackingFilter === 'all' || trackingData.trend === trackingFilter;
    
    return matchesSearch && matchesTeam && matchesPosition && matchesStatType && matchesTracking;
  });

  const handleRefresh = () => {
    console.log(`Refreshing ${leagueDisplay} props tracking data...`);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading {leagueDisplay} props tracker...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">Error loading props tracker: {error.message}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* League Selector */}
      <LeagueSelector
        selectedLeagues={selectedLeagues}
        onLeaguesChange={setSelectedLeagues}
      />

      {/* Header */}
      <div className="border-b border-slate-700 pb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3 text-white">
              <Activity className="h-10 w-10 text-blue-500" />
              {leagueDisplay} Props Tracker
            </h1>
            <p className="text-xl text-slate-400 mt-2">
              Real-time tracking of {leagueDisplay} prop changes and trends
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="h-4 w-4" />
                Last updated: {lastUpdateTime ? lastUpdateTime.toLocaleTimeString() : new Date().toLocaleTimeString()}
              </div>
              <Badge 
                variant={isConnected ? "default" : "outline"} 
                className={isConnected ? "text-xs bg-green-600 hover:bg-green-700" : "text-xs border-orange-500 text-orange-400"}
              >
                {isConnected ? (
                  <><Wifi className="h-3 w-3 mr-1" /> Live Connected</>
                ) : (
                  <><WifiOff className="h-3 w-3 mr-1" /> Connecting...</>
                )}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button onClick={handleRefresh} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={() => clearChanges()} 
              variant="outline" 
              size="sm" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Tracking
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500 glass-card border border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">New Props</p>
                <p className="text-3xl font-bold text-green-400">
                  {newProps.length}
                </p>
              </div>
              <Badge className="bg-green-600">Live</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500 glass-card border border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Changed Props</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {changedProps.length}
                </p>
              </div>
              <Badge className="bg-yellow-600">Live</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500 glass-card border border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Removed Props</p>
                <p className="text-3xl font-bold text-red-400">
                  {removedProps.length}
                </p>
              </div>
              <Badge className="bg-red-600">Live</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500 glass-card border border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">All Props</p>
                <p className="text-3xl font-bold text-blue-400">
                  {filteredProps.length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Real-time Tracking Tabs */}
      <Tabs defaultValue="all" className="glass-card border border-slate-700" onValueChange={(v) => setActiveTab(v as any)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Activity className="h-5 w-5" />
            Real-time Props Tracking
          </CardTitle>
          <TabsList className="grid grid-cols-4 mt-2">
            <TabsTrigger value="all">All Props</TabsTrigger>
            <TabsTrigger value="new" className="text-green-400">New Props</TabsTrigger>
            <TabsTrigger value="changed" className="text-yellow-400">Changed Props</TabsTrigger>
            <TabsTrigger value="removed" className="text-red-400">Removed Props</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <TabsContent value="all" className="mt-0">
            <div className="text-sm text-slate-400 mb-4">
              Showing all props with real-time updates
            </div>
          </TabsContent>
          <TabsContent value="new" className="mt-0">
            <div className="text-sm text-slate-400 mb-4">
              Showing {newProps.length} newly added props since you started tracking
            </div>
          </TabsContent>
          <TabsContent value="changed" className="mt-0">
            <div className="text-sm text-slate-400 mb-4">
              Showing {changedProps.length} props that have changed values since you started tracking
            </div>
          </TabsContent>
          <TabsContent value="removed" className="mt-0">
            <div className="text-sm text-slate-400 mb-4">
              Showing {removedProps.length} props that have been removed since you started tracking
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>

      {/* Filters */}
      <Card className="glass-card border border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search players, teams, stats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger>
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {positions.map(position => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatType} onValueChange={setSelectedStatType}>
              <SelectTrigger>
                <SelectValue placeholder="Stat Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stats</SelectItem>
                {statTypes.map(statType => (
                  <SelectItem key={statType} value={statType}>
                    {statType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={trackingFilter} onValueChange={(value) => setTrackingFilter(value as 'all' | 'rising' | 'falling' | 'stable')}>
              <SelectTrigger>
                <SelectValue placeholder="Trend" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trends</SelectItem>
                <SelectItem value="rising">Rising</SelectItem>
                <SelectItem value="falling">Falling</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Props Tracking Table */}
      <Card className="glass-card border border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            {activeTab === 'all' && `${leagueDisplay} Props Tracking (${filteredProps.length})`}
            {activeTab === 'new' && `New Props (${newProps.length})`}
            {activeTab === 'changed' && `Changed Props (${changedProps.length})`}
            {activeTab === 'removed' && `Removed Props (${removedProps.length})`}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {activeTab === 'all' && 'All available props with real-time updates'}
            {activeTab === 'new' && 'Props that have been added since tracking started'}
            {activeTab === 'changed' && 'Props that have changed values since tracking started'}
            {activeTab === 'removed' && 'Props that have been removed since tracking started'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Display regular props list when "all" tab is active */}
            {activeTab === 'all' && filteredProps.map((prop) => {
              const trackingData = getTrackingData(prop);
              return (
                <div key={prop.prop_id} className="glass-card border border-slate-600 p-4 hover:border-slate-500 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold text-white">{prop.player_name}</h3>
                          <p className="text-sm text-slate-400">{prop.team} vs {prop.against_team} • {prop.position}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-400">{prop.stat_type}</p>
                          <p className="text-2xl font-bold text-blue-400">{prop.line_score}</p>
                        </div>
                        <Badge 
                          variant={prop.odds_type === 'demon' ? 'destructive' : prop.odds_type === 'goblin' ? 'secondary' : 'default'}
                          className={
                            prop.odds_type === 'demon' ? 'bg-red-600 hover:bg-red-700' :
                            prop.odds_type === 'goblin' ? 'bg-green-600 hover:bg-green-700' :
                            'bg-blue-600 hover:bg-blue-700'
                          }
                        >
                          {prop.odds_type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          {trackingData.trend === 'rising' && <TrendingUp className="h-4 w-4 text-green-400" />}
                          {trackingData.trend === 'falling' && <TrendingDown className="h-4 w-4 text-red-400" />}
                          {trackingData.trend === 'stable' && <Activity className="h-4 w-4 text-blue-400" />}
                          <span className={`font-medium ${
                            trackingData.trend === 'rising' ? 'text-green-400' :
                            trackingData.trend === 'falling' ? 'text-red-400' :
                            'text-blue-400'
                          }`}>
                            {trackingData.trend === 'rising' ? 'Rising' :
                             trackingData.trend === 'falling' ? 'Falling' : 'Stable'}
                          </span>
                          {trackingData.changePercent !== 0 && (
                            <span className={`${trackingData.changePercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ({trackingData.changePercent > 0 ? '+' : ''}{trackingData.changePercent}%)
                            </span>
                          )}
                        </div>
                        
                        <div className="text-slate-400">
                          Score: <span className="text-white font-medium">{prop.sorting_score.toFixed(2)}</span>
                        </div>
                        
                        <div className="text-slate-400">
                          Updated: <span className="text-white">{trackingData.lastUpdate.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Display new props */}
            {activeTab === 'new' && newProps.map((prop) => (
              <div key={prop.prop_id} className="glass-card border-2 border-green-500 p-4 hover:border-green-400 transition-colors bg-green-900/10">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <Badge className="bg-green-600">New</Badge>
                      <div>
                        <h3 className="font-semibold text-white">{prop.player_name}</h3>
                        <p className="text-sm text-slate-400">{prop.team} vs {prop.against_team} • {prop.position}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-400">{prop.stat_type}</p>
                        <p className="text-2xl font-bold text-green-400">{prop.line_score}</p>
                      </div>
                      <Badge 
                        variant={prop.odds_type === 'demon' ? 'destructive' : prop.odds_type === 'goblin' ? 'secondary' : 'default'}
                        className={
                          prop.odds_type === 'demon' ? 'bg-red-600 hover:bg-red-700' :
                          prop.odds_type === 'goblin' ? 'bg-green-600 hover:bg-green-700' :
                          'bg-blue-600 hover:bg-blue-700'
                        }
                      >
                        {prop.odds_type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Display changed props */}
            {activeTab === 'changed' && changedProps.map((change) => (
              <div key={change.prop.prop_id} className="glass-card border-2 border-yellow-500 p-4 hover:border-yellow-400 transition-colors bg-yellow-900/10">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <Badge className="bg-yellow-600">Changed</Badge>
                      <div>
                        <h3 className="font-semibold text-white">{change.prop.player_name}</h3>
                        <p className="text-sm text-slate-400">{change.prop.team} vs {change.prop.against_team} • {change.prop.position}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-400">{change.prop.stat_type}</p>
                        <div className="flex items-center gap-2">
                          {change.changes?.line_score && (
                            <>
                              <span className="text-xl text-yellow-400 line-through">{change.changes.line_score.previous}</span>
                              <span className="text-2xl font-bold text-yellow-300">{change.changes.line_score.current}</span>
                            </>
                          )}
                          {!change.changes?.line_score && (
                            <span className="text-2xl font-bold text-yellow-300">{change.prop.line_score}</span>
                          )}
                        </div>
                      </div>
                      <div>
                        {change.changes?.odds_type && (
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="line-through border-slate-500 text-slate-400">
                              {change.changes.odds_type.previous}
                            </Badge>
                            <Badge 
                              variant={change.prop.odds_type === 'demon' ? 'destructive' : change.prop.odds_type === 'goblin' ? 'secondary' : 'default'}
                              className={
                                change.prop.odds_type === 'demon' ? 'bg-red-600 hover:bg-red-700' :
                                change.prop.odds_type === 'goblin' ? 'bg-green-600 hover:bg-green-700' :
                                'bg-blue-600 hover:bg-blue-700'
                              }
                            >
                              {change.prop.odds_type}
                            </Badge>
                          </div>
                        )}
                        {!change.changes?.odds_type && (
                          <Badge 
                            variant={change.prop.odds_type === 'demon' ? 'destructive' : change.prop.odds_type === 'goblin' ? 'secondary' : 'default'}
                            className={
                              change.prop.odds_type === 'demon' ? 'bg-red-600 hover:bg-red-700' :
                              change.prop.odds_type === 'goblin' ? 'bg-green-600 hover:bg-green-700' :
                              'bg-blue-600 hover:bg-blue-700'
                            }
                          >
                            {change.prop.odds_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Display removed props */}
            {activeTab === 'removed' && removedProps.map((prop) => (
              <div key={prop.prop_id} className="glass-card border-2 border-red-500 p-4 hover:border-red-400 transition-colors bg-red-900/10 opacity-80">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <Badge className="bg-red-600">Removed</Badge>
                      <div>
                        <h3 className="font-semibold text-white line-through">{prop.player_name}</h3>
                        <p className="text-sm text-slate-400">{prop.team} vs {prop.against_team} • {prop.position}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-400">{prop.stat_type}</p>
                        <p className="text-2xl font-bold text-red-400 line-through">{prop.line_score}</p>
                      </div>
                      <Badge 
                        variant="outline"
                        className="line-through border-slate-500 text-slate-400"
                      >
                        {prop.odds_type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* No props found message */}
            {activeTab === 'all' && filteredProps.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-400">No {leagueDisplay} props found matching your criteria.</p>
              </div>
            )}
            
            {activeTab === 'new' && newProps.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-400">No new props have been detected yet. Keep the tracker open to monitor changes.</p>
              </div>
            )}
            
            {activeTab === 'changed' && changedProps.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-400">No prop changes have been detected yet. Keep the tracker open to monitor changes.</p>
              </div>
            )}
            
            {activeTab === 'removed' && removedProps.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-400">No props have been removed yet. Keep the tracker open to monitor changes.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
