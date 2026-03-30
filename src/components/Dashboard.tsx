
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Activity, Users, Trophy, ArrowRight, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LeagueSelector } from './LeagueSelector';
import { PropsTable } from './PropsTable';
import { PropsFilters } from './PropsFilters';
import { useMultiLeagueProps } from '@/utils/multiLeagueUtils';
import { PropFilters } from '@/types/nba';

export const Dashboard = () => {
  const [selectedLeagues, setSelectedLeagues] = useState<('NBA' | 'NFL')[]>(['NBA']);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PropFilters>({});
  
  const { props: allProps, isLoading, error, refetch, leagueDisplay, locked } = useMultiLeagueProps(selectedLeagues);

  // Calculate stats based on selected leagues
  const totalProps = allProps.length;
  const standardProps = allProps.filter(p => p.odds_type === 'standard').length;
  const demonProps = allProps.filter(p => p.odds_type === 'demon').length;
  const goblinProps = allProps.filter(p => p.odds_type === 'goblin').length;

  // Filter props based on search and filters
  const filteredProps = allProps.filter(prop => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (!prop.player_name.toLowerCase().includes(searchLower) &&
          !prop.team.toLowerCase().includes(searchLower) &&
          !prop.stat_type.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    if (locked) return true;

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

    // Sample size filter
    if (filters.sample_sizes && filters.sample_sizes.length > 0) {
      if (!filters.sample_sizes.includes(prop.sample_size)) return false;
    }

    return true;
  });

  const statCards = [
    {
      title: "Total Props",
      value: totalProps,
      description: `Active ${leagueDisplay} props available`,
      icon: <BarChart3 className="h-9 w-9 text-blue-400" />,
      gradient: 'from-black-500/80 to-blue-600/80',
      border: 'border-blue-500/30'
    },
    {
      title: "Standard Props",
      value: standardProps,
      description: "Standard confidence props",
      icon: <TrendingUp className="h-9 w-9 text-blue-400" />,
      gradient: 'from-blue-500/80 to-blue-600/40',
      border: 'border-blue-500/30'
    },
    {
      title: "Demon Props",
      value: demonProps,
      description: "High-risk, high-reward props",
      icon: <img src="demon.png" alt="demon" className="w-10 h-10" />,
      gradient: 'from-red-500/80 to-red-600/20',
      border: 'border-red-500/30'
    },
    {
      title: "Goblin Props",
      value: goblinProps,
      description: "Low-risk, low-reward props",
      icon: <img src="goblin_updated.png" alt="Goblin" className="w-10 h-10" />,
      gradient: 'from-green-500/80 to-green-600/30',
      border: 'border-green-500/30'
    }
  ];

  const quickActions = [
    {
      title: "Top Props",
      description: `View best ${leagueDisplay} props today`,
      icon: Trophy,
      link: "/best-props",
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Props Tracker",
      description: `Track ${leagueDisplay} prop changes`,
      icon: Activity,
      link: "/tracker",
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Compare Props",
      description: `Compare ${leagueDisplay} props side-by-side`,
      icon: BarChart3,
      link: "/compare",
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "Using Proplytics",
      description: "Learn how to maximize your success",
      icon: HelpCircle,
      link: "/using-proplytics",
      color: "bg-orange-600 hover:bg-orange-700"
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
          selectedLeagues={selectedLeagues}
          onLeaguesChange={setSelectedLeagues}
        />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3 leading-tight">
            {leagueDisplay} Props Analytics
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-0 leading-relaxed">
            Advanced analytics and insights for {leagueDisplay} with real-time data taken directly from Prizepicks and AI-powered insights for winning strategies
          </p>
          
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className={`bg-gradient-to-br ${stat.gradient} backdrop-blur-xl border ${stat.border} shadow-2xl rounded-2xl hover:scale-105 transition-all duration-300 group`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{stat.description}</p>
                  </div>
                  <div className="p-1 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <CardTitle className="text-white">{leagueDisplay} Props Overview</CardTitle>
            <CardDescription className="text-slate-400">
              Complete view of all {leagueDisplay} props with advanced filtering
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
              locked={locked}
              onViewModeChange={setViewMode}
              viewMode={viewMode}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              allProps={allProps}
              selectedLeague={selectedLeagues[0]}
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
