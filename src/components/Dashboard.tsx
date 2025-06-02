
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Activity, Users, Trophy, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LeagueSelector } from './LeagueSelector';
import { getPropsForLeague } from '@/utils/multiLeagueSampleData';

export const Dashboard = () => {
  const [selectedLeague, setSelectedLeague] = useState<'NBA' | 'NFL' | 'MLB'>('NBA');
  const props = getPropsForLeague(selectedLeague);

  // Calculate stats based on selected league
  const totalProps = props.length;
  const demonProps = props.filter(p => p.odds_type === 'demon').length;
  const goblinProps = props.filter(p => p.odds_type === 'goblin').length;
  const standardProps = props.filter(p => p.odds_type === 'standard').length;
  const topScore = Math.max(...props.map(p => p.sorting_score));

  const statCards = [
    {
      title: "Total Props",
      value: totalProps,
      description: `Active ${selectedLeague} props available`,
      icon: BarChart3,
      color: "text-blue-400"
    },
    {
      title: "Top Score",
      value: topScore.toFixed(1),
      description: "Highest scoring prop today",
      icon: Trophy,
      color: "text-yellow-400"
    },
    {
      title: "Demon Props",
      value: demonProps,
      description: "High-risk, high-reward props",
      icon: TrendingUp,
      color: "text-red-400"
    },
    {
      title: "Active Players",
      value: new Set(props.map(p => p.player_id)).size,
      description: `Unique ${selectedLeague} players tracked`,
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

        {/* Recent Props Preview */}
        <Card className="glass-card border border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Top {selectedLeague} Props Today</CardTitle>
            <CardDescription className="text-slate-400">
              Highest scoring props based on our advanced analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {props.slice(0, 3).map((prop) => (
                <div key={prop.prop_id} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium text-white">{prop.player_name}</p>
                      <p className="text-sm text-slate-400">{prop.team} vs {prop.against_team}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">{prop.stat_type}</p>
                    <p className="font-bold text-white">{prop.line_score}</p>
                  </div>
                  <div className="text-right">
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
                    <p className="text-sm text-slate-400 mt-1">Score: {prop.sorting_score.toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link to="/best-props">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  View All {selectedLeague} Props
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
