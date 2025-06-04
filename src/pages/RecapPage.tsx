
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
const generateSampleData = (league: 'NBA' | 'NFL' | 'MLB'): DayRecap[] => {
  const days = [];
  const propTypes = {
    NBA: ['Points', 'Rebounds', 'Assists', '3-Pointers', 'Steals', 'Blocks'],
    NFL: ['Passing Yards', 'Rushing Yards', 'Receiving Yards', 'Touchdowns', 'Receptions'],
    MLB: ['Hits', 'Runs', 'RBIs', 'Home Runs', 'Stolen Bases', 'Strikeouts']
  };
  
  const players = {
    NBA: ['LeBron James', 'Stephen Curry', 'Luka Dončić', 'Jayson Tatum', 'Giannis Antetokounmpo'],
    NFL: ['Josh Allen', 'Patrick Mahomes', 'Lamar Jackson', 'Justin Jefferson', 'Cooper Kupp'],
    MLB: ['Mike Trout', 'Mookie Betts', 'Aaron Judge', 'Ronald Acuña Jr.', 'Freddie Freeman']
  };

  const teams = {
    NBA: ['LAL', 'GSW', 'DAL', 'BOS', 'MIL'],
    NFL: ['BUF', 'KC', 'BAL', 'MIN', 'LAR'],
    MLB: ['LAA', 'LAD', 'NYY', 'ATL', 'LAD']
  };

  for (let i = 0; i < 7; i++) {
    const date = startOfDay(subDays(new Date(), i));
    const numPicks = Math.floor(Math.random() * 8) + 3; // 3-10 picks per day
    const picks: PropPick[] = [];
    
    for (let j = 0; j < numPicks; j++) {
      const propType = propTypes[league][Math.floor(Math.random() * propTypes[league].length)];
      const player = players[league][Math.floor(Math.random() * players[league].length)];
      const team = teams[league][Math.floor(Math.random() * teams[league].length)];
      const opponent = teams[league][Math.floor(Math.random() * teams[league].length)];
      
      // Generate realistic lines based on prop type
      let line: number;
      let finalResult: number;
      
      switch (propType) {
        case 'Points':
          line = Math.floor(Math.random() * 15) + 20; // 20-35 points
          finalResult = line + (Math.random() - 0.5) * 10;
          break;
        case 'Passing Yards':
          line = Math.floor(Math.random() * 100) + 250; // 250-350 yards
          finalResult = line + (Math.random() - 0.5) * 80;
          break;
        case 'Hits':
          line = 1.5; // Common baseball line
          finalResult = Math.floor(Math.random() * 4); // 0-3 hits
          break;
        default:
          line = Math.floor(Math.random() * 10) + 5; // 5-15 for other stats
          finalResult = line + (Math.random() - 0.5) * 6;
      }
      
      finalResult = Math.max(0, Math.round(finalResult * 10) / 10);
      
      let outcome: 'win' | 'loss' | 'push';
      if (Math.abs(finalResult - line) < 0.1) {
        outcome = 'push';
      } else if (finalResult > line) {
        outcome = Math.random() > 0.5 ? 'win' : 'loss'; // Sometimes over is a loss (under bet)
      } else {
        outcome = Math.random() > 0.5 ? 'win' : 'loss'; // Sometimes under is a win (under bet)
      }
      
      const grades: ('A' | 'B' | 'C' | 'D' | 'F')[] = ['A', 'B', 'C', 'D', 'F'];
      const grade = Math.random() > 0.3 ? grades[Math.floor(Math.random() * grades.length)] : undefined;
      
      picks.push({
        id: `${date.getTime()}-${j}`,
        player_name: player,
        prop_type: propType,
        line,
        final_result: finalResult,
        outcome,
        grade,
        team,
        opponent
      });
    }
    
    const wins = picks.filter(p => p.outcome === 'win').length;
    const losses = picks.filter(p => p.outcome === 'loss').length;
    const pushes = picks.filter(p => p.outcome === 'push').length;
    const winRate = wins > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
    
    days.push({
      date,
      picks,
      total_picks: picks.length,
      wins,
      losses,
      pushes,
      win_rate: winRate
    });
  }
  
  return days;
};

const RecapPage = () => {
  const [selectedLeague, setSelectedLeague] = useState<'NBA' | 'NFL' | 'MLB'>('NBA');
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('7');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set(['0'])); // First day expanded by default

  // Generate sample data based on selected league
  const recapData = useMemo(() => generateSampleData(selectedLeague), [selectedLeague]);

  // Filter data based on date range
  const filteredData = useMemo(() => {
    const days = parseInt(dateRange);
    const cutoffDate = subDays(new Date(), days);
    return recapData.filter(recap => recap.date >= cutoffDate);
  }, [recapData, dateRange]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const totalPicks = filteredData.reduce((sum, day) => sum + day.total_picks, 0);
    const totalWins = filteredData.reduce((sum, day) => sum + day.wins, 0);
    const totalLosses = filteredData.reduce((sum, day) => sum + day.losses, 0);
    const totalPushes = filteredData.reduce((sum, day) => sum + day.pushes, 0);
    const overallWinRate = totalWins > 0 ? Math.round((totalWins / (totalWins + totalLosses)) * 100) : 0;
    
    return {
      totalPicks,
      totalWins,
      totalLosses,
      totalPushes,
      overallWinRate
    };
  }, [filteredData]);

  const toggleDay = (dayIndex: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayIndex)) {
      newExpanded.delete(dayIndex);
    } else {
      newExpanded.add(dayIndex);
    }
    setExpandedDays(newExpanded);
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'win':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'loss':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'push':
        return <Minus className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'win':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Win ✅</Badge>;
      case 'loss':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Loss ❌</Badge>;
      case 'push':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Push ➖</Badge>;
      default:
        return null;
    }
  };

  const getGradeBadge = (grade?: string) => {
    if (!grade) return null;
    
    const gradeColors = {
      A: 'bg-green-500/20 text-green-400 border-green-500/30',
      B: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      C: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      D: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      F: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    
    return (
      <Badge variant="outline" className={gradeColors[grade as keyof typeof gradeColors]}>
        {grade}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Prop Pick Recap</h1>
              <p className="text-muted-foreground">
                Review your past prop pick performance and track your winning streaks
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <LeagueSelector 
              selectedLeague={selectedLeague}
              onLeagueChange={setSelectedLeague}
              className="w-fit"
            />
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={dateRange} onValueChange={(value: '7' | '30' | '90') => setDateRange(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Past 7 days</SelectItem>
                  <SelectItem value="30">Past 30 days</SelectItem>
                  <SelectItem value="90">Past 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{overallStats.totalPicks}</p>
                  <p className="text-sm text-muted-foreground">Total Picks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{overallStats.totalWins}</p>
                  <p className="text-sm text-muted-foreground">Wins</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{overallStats.totalLosses}</p>
                  <p className="text-sm text-muted-foreground">Losses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Minus className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{overallStats.totalPushes}</p>
                  <p className="text-sm text-muted-foreground">Pushes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{overallStats.overallWinRate}%</p>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Recaps */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Daily Recaps</h2>
          
          {filteredData.length > 0 ? (
            <div className="space-y-3">
              {filteredData.map((dayRecap, index) => {
                const dayKey = index.toString();
                const isExpanded = expandedDays.has(dayKey);
                
                return (
                  <Card key={dayKey} className="bg-card border-border transition-all duration-200 hover:shadow-lg">
                    <Collapsible open={isExpanded} onOpenChange={() => toggleDay(dayKey)}>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <CardTitle className="text-lg">
                                  {format(dayRecap.date, 'EEEE, MMMM d, yyyy')}
                                </CardTitle>
                                <CardDescription>
                                  {dayRecap.total_picks} picks • {dayRecap.win_rate}% win rate
                                </CardDescription>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              {/* Day Summary */}
                              <div className="flex items-center gap-2 text-sm">
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                  {dayRecap.wins}W
                                </Badge>
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                  {dayRecap.losses}L
                                </Badge>
                                {dayRecap.pushes > 0 && (
                                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                    {dayRecap.pushes}P
                                  </Badge>
                                )}
                              </div>
                              
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="transition-all duration-200 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <CardContent className="pt-0">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="border-b border-border">
                                <tr>
                                  <th className="text-left p-3 font-medium text-muted-foreground">Player</th>
                                  <th className="text-left p-3 font-medium text-muted-foreground">Prop</th>
                                  <th className="text-center p-3 font-medium text-muted-foreground">Line</th>
                                  <th className="text-center p-3 font-medium text-muted-foreground">Result</th>
                                  <th className="text-center p-3 font-medium text-muted-foreground">Outcome</th>
                                  <th className="text-center p-3 font-medium text-muted-foreground">Grade</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dayRecap.picks.map((pick) => (
                                  <tr key={pick.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                    <td className="p-3">
                                      <div>
                                        <div className="font-medium text-foreground">{pick.player_name}</div>
                                        <div className="text-sm text-muted-foreground">{pick.team} vs {pick.opponent}</div>
                                      </div>
                                    </td>
                                    <td className="p-3 text-foreground">{pick.prop_type}</td>
                                    <td className="p-3 text-center">
                                      <span className="font-bold text-primary">{pick.line}</span>
                                    </td>
                                    <td className="p-3 text-center">
                                      <span className="font-bold text-foreground">{pick.final_result}</span>
                                    </td>
                                    <td className="p-3 text-center">
                                      {getOutcomeBadge(pick.outcome)}
                                    </td>
                                    <td className="p-3 text-center">
                                      {getGradeBadge(pick.grade)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Recap Data</h3>
                <p className="text-muted-foreground">
                  No {selectedLeague} prop pick data available for the selected date range.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecapPage;
