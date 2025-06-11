
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  TrendingDown, 
  Target,
  BarChart3,
  CheckCircle,
  XCircle,
  Minus
} from 'lucide-react';
import { LeagueSelector } from '@/components/LeagueSelector';
import { getSelectedLeaguesDisplay } from '@/utils/multiLeagueUtils';
import { format, subDays, startOfDay } from 'date-fns';

interface PropPick {
  id: string;
  player_name: string;
  prop_type: string;
  line: number;
  final_result: number;
  outcome: 'win' | 'loss' | 'push';
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
  team: string;
  opponent: string;
}

interface DayRecap {
  date: Date;
  picks: PropPick[];
  total_picks: number;
  wins: number;
  losses: number;
  pushes: number;
  win_rate: number;
}

// Sample data generator
const generateSampleData = (leagues: ('NBA' | 'NFL' | 'MLB')[]): DayRecap[] => {
  const days: DayRecap[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = subDays(new Date(), i);
    const picks: PropPick[] = [];
    
    // Generate sample picks for each selected league
    leagues.forEach(league => {
      const leaguePlayers = league === 'NBA' 
        ? ['LeBron James', 'Stephen Curry', 'Giannis Antetokounmpo'] 
        : league === 'NFL'
        ? ['Josh Allen', 'Patrick Mahomes', 'Lamar Jackson']
        : ['Shohei Ohtani', 'Aaron Judge', 'Mookie Betts'];
      
      const leagueStats = league === 'NBA'
        ? ['Points', 'Rebounds', 'Assists']
        : league === 'NFL' 
        ? ['Passing Yards', 'Rushing Yards', 'Touchdowns']
        : ['Hits', 'RBIs', 'Home Runs'];
      
      for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
        picks.push({
          id: `${league}-${i}-${j}`,
          player_name: leaguePlayers[Math.floor(Math.random() * leaguePlayers.length)],
          prop_type: leagueStats[Math.floor(Math.random() * leagueStats.length)],
          line: Math.random() * 30 + 10,
          final_result: Math.random() * 35 + 8,
          outcome: Math.random() > 0.6 ? 'win' : Math.random() > 0.8 ? 'push' : 'loss',
          grade: ['A', 'B', 'C', 'D', 'F'][Math.floor(Math.random() * 5)] as 'A' | 'B' | 'C' | 'D' | 'F',
          team: `${league}_TEAM`,
          opponent: `${league}_OPP`,
        });
      }
    });
    
    const wins = picks.filter(p => p.outcome === 'win').length;
    const losses = picks.filter(p => p.outcome === 'loss').length;
    const pushes = picks.filter(p => p.outcome === 'push').length;
    
    days.push({
      date,
      picks,
      total_picks: picks.length,
      wins,
      losses,
      pushes,
      win_rate: picks.length > 0 ? (wins / picks.length) * 100 : 0,
    });
  }
  
  return days;
};

export const RecapPage: React.FC = () => {
  const [selectedLeagues, setSelectedLeagues] = useState<('NBA' | 'NFL' | 'MLB')[]>(['NBA']);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('week');
  const [openDays, setOpenDays] = useState<Set<string>>(new Set());
  
  const leagueDisplay = getSelectedLeaguesDisplay(selectedLeagues);
  const sampleData = useMemo(() => generateSampleData(selectedLeagues), [selectedLeagues]);

  const toggleDay = (dateStr: string) => {
    const newOpenDays = new Set(openDays);
    if (newOpenDays.has(dateStr)) {
      newOpenDays.delete(dateStr);
    } else {
      newOpenDays.add(dateStr);
    }
    setOpenDays(newOpenDays);
  };

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const totalPicks = sampleData.reduce((sum, day) => sum + day.total_picks, 0);
    const totalWins = sampleData.reduce((sum, day) => sum + day.wins, 0);
    const totalLosses = sampleData.reduce((sum, day) => sum + day.losses, 0);
    const totalPushes = sampleData.reduce((sum, day) => sum + day.pushes, 0);
    
    return {
      totalPicks,
      totalWins,
      totalLosses,
      totalPushes,
      winRate: totalPicks > 0 ? (totalWins / totalPicks) * 100 : 0,
    };
  }, [sampleData]);

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'win':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'loss':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'push':
        return <Minus className="h-4 w-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-green-400';
      case 'B':
        return 'text-blue-400';
      case 'C':
        return 'text-yellow-400';
      case 'D':
        return 'text-orange-400';
      case 'F':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

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
              <Calendar className="h-10 w-10 text-blue-500" />
              {leagueDisplay} Props Recap
            </h1>
            <p className="text-xl text-slate-400 mt-2">
              Performance history and detailed analysis of your {leagueDisplay} prop picks
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="glass-card border border-slate-700">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold text-white">{overallStats.totalPicks}</p>
            <p className="text-sm text-slate-400">Total Picks</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border border-slate-700">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold text-green-400">{overallStats.totalWins}</p>
            <p className="text-sm text-slate-400">Wins</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border border-slate-700">
          <CardContent className="p-6 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
            <p className="text-2xl font-bold text-red-400">{overallStats.totalLosses}</p>
            <p className="text-sm text-slate-400">Losses</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border border-slate-700">
          <CardContent className="p-6 text-center">
            <Minus className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
            <p className="text-2xl font-bold text-yellow-400">{overallStats.totalPushes}</p>
            <p className="text-sm text-slate-400">Pushes</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border border-slate-700">
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-purple-400" />
            <p className="text-2xl font-bold text-purple-400">{overallStats.winRate.toFixed(1)}%</p>
            <p className="text-sm text-slate-400">Win Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Recaps */}
      <Card className="glass-card border border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Daily {leagueDisplay} Performance</CardTitle>
          <CardDescription className="text-slate-400">
            Detailed breakdown of your {leagueDisplay} prop picks by day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sampleData.map((day) => {
              const dateStr = format(day.date, 'yyyy-MM-dd');
              const isOpen = openDays.has(dateStr);
              
              return (
                <Collapsible key={dateStr} open={isOpen} onOpenChange={() => toggleDay(dateStr)}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-4 h-auto glass-card border border-slate-600 hover:bg-slate-700/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <div className="text-lg font-semibold text-white">
                            {format(day.date, 'EEEE, MMMM dd')}
                          </div>
                          <div className="text-sm text-slate-400">
                            {day.total_picks} picks • {day.wins}W-{day.losses}L-{day.pushes}P • {day.win_rate.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={day.win_rate >= 60 ? 'border-green-400 text-green-400' : 
                                    day.win_rate >= 40 ? 'border-yellow-400 text-yellow-400' : 
                                    'border-red-400 text-red-400'}
                        >
                          {day.win_rate >= 60 ? 'Excellent' : day.win_rate >= 40 ? 'Good' : 'Poor'}
                        </Badge>
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="pt-4">
                    <div className="grid gap-3">
                      {day.picks.map((pick) => (
                        <div key={pick.id} className="p-4 border border-slate-600 rounded-lg bg-slate-800/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getOutcomeIcon(pick.outcome)}
                              <div>
                                <div className="font-medium text-white">
                                  {pick.player_name} - {pick.prop_type}
                                </div>
                                <div className="text-sm text-slate-400">
                                  {pick.team} vs {pick.opponent}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-slate-300">
                                Line: {pick.line.toFixed(1)} | Result: {pick.final_result.toFixed(1)}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant={pick.outcome === 'win' ? 'default' : pick.outcome === 'push' ? 'secondary' : 'destructive'}
                                  className="text-xs"
                                >
                                  {pick.outcome.toUpperCase()}
                                </Badge>
                                {pick.grade && (
                                  <span className={`text-sm font-bold ${getGradeColor(pick.grade)}`}>
                                    Grade: {pick.grade}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
