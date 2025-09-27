import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, TrendingUp, Search, Filter, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { LeagueSelector } from '@/components/LeagueSelector';
import { useMultiLeagueProps } from '@/utils/multiLeagueUtils';
import { Prop } from '@/types/nba';

export const PropsTrackerPage: React.FC = () => {
  const [selectedLeagues, setSelectedLeagues] = useState<('NBA' | 'NFL')[]>(['NBA']);
  const { props, isLoading, error, refetch, leagueDisplay } = useMultiLeagueProps(selectedLeagues);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [selectedStatType, setSelectedStatType] = useState<string>('all');

  // Get unique teams, positions, and stat types
  const teams = [...new Set(props.map(prop => prop.team))].sort();
  const positions = [...new Set(props.map(prop => prop.position))].filter(Boolean).sort();
  const statTypes = [...new Set(props.map(prop => prop.stat_type))].sort();

  // Filter props based on search and filters
  const filteredProps = props.filter(prop => {
    const matchesSearch = searchQuery === '' || 
      prop.player_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.stat_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTeam = selectedTeam === 'all' || prop.team === selectedTeam;
    const matchesPosition = selectedPosition === 'all' || prop.position === selectedPosition;
    const matchesStatType = selectedStatType === 'all' || prop.stat_type === selectedStatType;
    
    return matchesSearch && matchesTeam && matchesPosition && matchesStatType;
  });

  const handleRefresh = () => {
    // Refreshing props tracking data...
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
              Real-time tracking of {leagueDisplay} prop changes and trends from Prizepicks
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="h-4 w-4" />
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button onClick={handleRefresh} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 glass-card border border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Props</p>
                <p className="text-3xl font-bold text-blue-400">
                  {filteredProps.length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-slate-500 glass-card border border-slate-700 opacity-60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Real-time Tracking</p>
                <p className="text-lg font-bold text-slate-400">
                  Coming Soon
                </p>
              </div>
              <Badge className="bg-slate-600">Soon</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-slate-500 glass-card border border-slate-700 opacity-60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Change Alerts</p>
                <p className="text-lg font-bold text-slate-400">
                  Coming Soon
                </p>
              </div>
              <Badge className="bg-slate-600">Soon</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-slate-500 glass-card border border-slate-700 opacity-60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Live Updates</p>
                <p className="text-lg font-bold text-slate-400">
                  Coming Soon
                </p>
              </div>
              <Badge className="bg-slate-600">Soon</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Real-time Tracking - Coming Soon */}
      <Card className="glass-card border border-slate-700 opacity-60">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Activity className="h-5 w-5" />
            Real-time Props Tracking
            <Badge className="bg-slate-600 ml-2">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4">
              <Activity className="h-16 w-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">Real-time Tracking Coming Soon</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                We're working on implementing real-time prop tracking, change detection, and live updates. 
                This feature will allow you to monitor prop changes as they happen.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 border border-slate-600 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <h4 className="font-medium text-slate-300">Live Changes</h4>
                <p className="text-sm text-slate-400">Track prop line movements in real-time</p>
              </div>
              <div className="text-center p-4 border border-slate-600 rounded-lg">
                <AlertCircle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <h4 className="font-medium text-slate-300">Smart Alerts</h4>
                <p className="text-sm text-slate-400">Get notified of significant changes</p>
              </div>
              <div className="text-center p-4 border border-slate-600 rounded-lg">
                <Clock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h4 className="font-medium text-slate-300">Historical Data</h4>
                <p className="text-sm text-slate-400">View prop change history and trends</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      
    </div>
  );
};
