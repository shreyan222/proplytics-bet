
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Activity, Users, Trophy, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LeagueSelector } from './LeagueSelector';
import { PropsTable } from './PropsTable';
import { PropsFilters } from './PropsFilters';
import { getPropsForLeague } from '@/utils/multiLeagueSampleData';
import { PropFilters } from '@/types/nba';

export const Dashboard = () => {
  const [selectedLeague, setSelectedLeague] = useState<'NBA' | 'NFL' | 'MLB'>('NBA');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PropFilters>({});
  
  const props = getPropsForLeague(selectedLeague);

  // Calculate stats based on selected league
  const totalProps = props.length;
  const standardProps = props.filter(p => p.odds_type === 'standard').length;
  const demonProps = props.filter(p => p.odds_type === 'demon').length;
  const goblinProps = props.filter(p => p.odds_type === 'goblin').length;

  // Filter props based on search and filters
  const filteredProps = props.filter(prop => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (!prop.player_name.toLowerCase().includes(searchLower) &&
          !prop.team.toLowerCase().includes(searchLower) &&
          !prop.stat_type.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Team filter
    if (filters.teams && filters.teams.length > 0) {
      if (!filters.teams.includes(prop.team)) return false;
    }

    // Stat type filter
    if (filters.stat_types && filters.stat_types.length > 0) {
      if (!filters.stat_types.includes(prop.stat_type)) return false;
    }

    // Odds type filter
    if (filters.odds_types && filters.odds_types.length > 0) {
      if (!filters.odds_types.includes(prop.odds_type)) return false;
    }

    // Position filter
    if (filters.positions && filters.positions.length > 0) {
      if (!filters.positions.includes(prop.position)) return false;
    }

    return true;
  });

  const statCards = [
    {
      title: "Total Props",
      value: totalProps,
      description: `Active ${selectedLeague} props available`,
      icon: BarChart3,
      color: "text-blue-400"
    },
    {
      title: "Standard Props",
      value: standardProps,
      description: "Standard confidence props",
      icon: Trophy,
      color: "text-blue-400"
    },
    {
      title: "Demon Props",
      value: demonProps,
      description: "High-risk, high-reward props",
      icon: TrendingUp,
      color: "text-red-400"
    },
    {
      title: "Goblin Props",
      value: goblinProps,
      description: "Premium high-confidence props",
      icon: Users,
      color: "text-green-400"
    }
  ];

  const quickActions = [
    {
      title: "Top Props",
      description: `View best ${selectedLeague} props today`,
      icon: Trophy,
      link: "/best-props",
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Props Tracker",
      description: `Track ${selectedLeague} prop changes`,
      icon: Activity,
      link: "/tracker",
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Compare Props",
      description: `Compare ${selectedLeague} props side-by-side`,
      icon: BarChart3,
      link: "/compare",
      color: "bg-purple-600 hover:bg-purple-700"
    }
  ];

  const handleFiltersChange = (newFilters: PropFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-40 right-10 w-80 h-80 bg-blue-600 opacity-15 rounded-full blur-2xl animate-ping" />
      
      <div className="relative z-10 container mx-auto p-6 space-y-6">
        {/* League Selector */}
        <LeagueSelector
          selectedLeague={selectedLeague}
          onLeagueChange={setSelectedLeague}
        />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">
            {selectedLeague} Props Analytics
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Advanced analytics and insights for {selectedLeague} prop betting with real-time data and AI-powered scoring
          </p>
          <Badge className="mt-4 bg-green-600 hover:bg-green-700">
            <Activity className="h-3 w-3 mr-1" />
            Live Data
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="glass-card border border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link}>
              <Card className="glass-card border border-slate-700 hover:border-slate-600 transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <action.icon className="h-8 w-8 text-blue-400" />
                    <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                  <p className="text-sm text-slate-400">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Props Table Section */}
        <Card className="glass-card border border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">{selectedLeague} Props Overview</CardTitle>
            <CardDescription className="text-slate-400">
              Complete view of all {selectedLeague} props with advanced filtering
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filters */}
            <PropsFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              totalProps={totalProps}
              filteredProps={filteredProps.length}
              onViewModeChange={setViewMode}
              viewMode={viewMode}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Props Table */}
            <PropsTable
              props={filteredProps}
              viewMode={viewMode}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
