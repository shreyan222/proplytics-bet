
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Prop } from '@/types/nba';
import { TrendingUp, TrendingDown, Minus, User, X, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Button } from '@/components/ui/button';

interface ComparisonTableProps {
  props: Prop[];
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ props }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Prop | null>(null);
  const [selectedChart, setSelectedChart] = useState<'h2h' | 'l5'>('l5');

  const getScoreColor = (score: number) => {
    if (score >= 0.875) return 'text-green-400';
    if (score >= 0.75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getOddsBadgeVariant = (oddsType: string) => {
    switch (oddsType.toLowerCase()) {
      case 'demon': return 'destructive';
      case 'goblin': return 'default';
      case 'standard':
      default: return 'secondary';
    }
  };

  const formatGameResults = (games: number[], line: number) => {
    if (!games || games.length === 0) {
      return <span className="text-slate-500 text-xs">No data</span>;
    }
    
    return games.slice(-10).map((game, index) => (
      <span
        key={index}
        className={`inline-block w-6 h-6 text-xs rounded mx-0.5 text-center leading-6 ${
          game >= line ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}
      >
        {game >= line ? '✓' : '✗'}
      </span>
    ));
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-slate-400" />;
  };

  const calculateHitRate = (games: number[], line: number) => {
    if (!games || games.length === 0) return 0;
    const hits = games.filter(game => game >= line).length;
    return (hits / games.length) * 100;
  };

  const handlePlayerClick = (prop: Prop) => {
    setSelectedPlayer(prop);
  };

  // Player Details Dialog Component
  const PlayerDetailDialog = ({ prop }: { prop: Prop }) => {
    const hasPerformanceData = (prop.h2h_array && prop.h2h_array.length > 0) || (prop.l5_array && prop.l5_array.length > 0);

    return (
      <DialogContent className="max-w-4xl glass border border-slate-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
              <User className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <div className="text-xl text-white">{prop.player_name}</div>
              <div className="text-sm text-slate-400">{prop.team} • {prop.position}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPlayer(null)}
              className="ml-auto h-8 w-8 p-0 hover:bg-red-600/20 hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Player Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-sm text-slate-400 mb-1">Prop Score</div>
                <div className={`text-2xl font-bold ${getScoreColor(prop.sorting_score_computed || prop.sorting_score)}`}>
                  {(prop.sorting_score_computed || prop.sorting_score).toFixed(3)}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-sm text-slate-400 mb-1">H2H Score</div>
                <div className="text-2xl font-bold text-blue-400">
                  {(prop.h2h_score_computed || prop.h2h_score).toFixed(3)}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-sm text-slate-400 mb-1">L5 Score</div>
                <div className="text-2xl font-bold text-green-400">
                  {(prop.l5_score_computed || prop.l5_score).toFixed(3)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Charts */}
          {hasPerformanceData && (
            <Card className="glass-card border border-slate-700">
              <CardContent className="p-6">
                {/* Mini Tabs for Chart Selection */}
                <div className="flex gap-1 mb-6 p-1 bg-slate-800/50 rounded-lg border border-slate-700">
                  <button
                    onClick={() => setSelectedChart('h2h')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      selectedChart === 'h2h' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    H2H ({prop.h2h_array?.length || 0} games)
                  </button>
                  <button
                    onClick={() => setSelectedChart('l5')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      selectedChart === 'l5' 
                        ? 'bg-green-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    L5 ({prop.l5_array?.length || 0} games)
                  </button>
                </div>

                {/* Performance Chart */}
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={(selectedChart === 'h2h' ? prop.h2h_array : prop.l5_array)?.map((score, idx) => ({
                        game: `G${idx + 1}`,
                        performance: score,
                        color: score >= prop.line_score ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)',
                        borderColor: score >= prop.line_score ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                      })) || []} 
                      margin={{ top: 20, right: 60, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(71, 85, 105, 0.3)" />
                      <XAxis 
                        dataKey="game" 
                        stroke="rgb(148, 163, 184)"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="rgb(148, 163, 184)"
                        fontSize={12}
                        domain={[0, 'dataMax + 1']}
                        tickFormatter={(value) => value.toFixed(1)}
                        label={{ 
                          value: `${prop.stat_type}`, 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { textAnchor: 'middle', fill: 'rgb(148, 163, 184)' }
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgb(71, 85, 105)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                        labelStyle={{ color: 'rgb(148, 163, 184)' }}
                        formatter={(value, name) => [`${value} ${prop.stat_type}`, 'Performance']}
                      />
                      <ReferenceLine 
                        y={prop.line_score} 
                        stroke="rgb(74, 222, 128)" 
                        strokeDasharray="6 4"
                        strokeWidth={2}
                        label={{ 
                          value: `Line: ${prop.line_score}`, 
                          position: 'insideRight',
                          fill: 'rgb(74, 222, 128)',
                          fontSize: 11,
                          fontWeight: 'bold',
                          offset: 10
                        }}
                      />
                      <Bar 
                        dataKey="performance" 
                        radius={4}
                        fill="currentColor"
                      >
                        {(selectedChart === 'h2h' ? prop.h2h_array : prop.l5_array)?.map((score, index) => (
                          <Cell key={`cell-${index}`} fill={score >= prop.line_score ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'} />
                        )) || []}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-slate-400">Over Line</div>
                    <div className="text-green-400 font-semibold text-lg">
                      {(selectedChart === 'h2h' ? prop.h2h_array : prop.l5_array)?.filter(score => score >= prop.line_score).length || 0}/{(selectedChart === 'h2h' ? prop.h2h_array : prop.l5_array)?.length || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400">Under Line</div>
                    <div className="text-red-400 font-semibold text-lg">
                      {(selectedChart === 'h2h' ? prop.h2h_array : prop.l5_array)?.filter(score => score < prop.line_score).length || 0}/{(selectedChart === 'h2h' ? prop.h2h_array : prop.l5_array)?.length || 0}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Stats */}
          <Card className="glass-card border border-slate-700">
            <CardContent className="p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                Detailed Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Line Score:</span>
                  <div className="font-medium text-white text-lg">{prop.line_score}</div>
                </div>
                <div>
                  <span className="text-slate-400">H2H Average:</span>
                  <div className="font-medium text-blue-400 text-lg">{prop.h2h_avg?.toFixed(1) || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-slate-400">L5 Average:</span>
                  <div className="font-medium text-green-400 text-lg">{prop.l5_avg?.toFixed(1) || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-slate-400">Sample Size:</span>
                  <div className="font-medium text-white text-lg">{prop.sample_size || 0} games</div>
                </div>
                <div>
                  <span className="text-slate-400">H2H Hit Rate:</span>
                  <div className="font-medium text-blue-400 text-lg">
                    {calculateHitRate(prop.h2h_array || [], prop.line_score).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">L5 Hit Rate:</span>
                  <div className="font-medium text-green-400 text-lg">
                    {calculateHitRate(prop.l5_array || [], prop.line_score).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Matchup Rank:</span>
                  <div className="font-medium text-white text-lg">{prop.matchup_rank || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-slate-400">Odds Type:</span>
                  <div className="font-medium text-white">
                    <Badge variant={getOddsBadgeVariant(prop.odds_type)}>
                      {prop.odds_type}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    );
  };

  return (
    <Card className="glass-card border border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          Props Comparison Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300 font-semibold min-w-[200px] sticky left-0 bg-slate-800/80 backdrop-blur-sm">
                  Metric
                </TableHead>
                {props.map((prop, index) => (
                  <TableHead key={prop.prop_id} className="text-center text-slate-300 font-semibold min-w-[200px]">
                    Prop {index + 1}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Player Info Row */}
              <TableRow className="border-slate-700">
                <TableCell className="font-medium text-slate-300 sticky left-0 bg-slate-800/80 backdrop-blur-sm">
                  Player Info
                </TableCell>
                {props.map((prop) => (
                  <TableCell key={prop.prop_id} className="text-center">
                    <div 
                      className="space-y-1 cursor-pointer hover:bg-slate-700/30 p-2 rounded-lg transition-colors"
                      onClick={() => handlePlayerClick(prop)}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <User className="h-4 w-4 text-blue-400" />
                        <div className="text-white font-semibold">{prop.player_name}</div>
                      </div>
                      <div className="text-slate-400 text-sm">{prop.position}</div>
                      <div className="text-xs text-blue-400 flex items-center gap-1">
                        <span>Click to view details</span>
                        <span className="text-blue-300">↗</span>
                      </div>
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              {/* Team & Matchup Row */}
              <TableRow className="border-slate-700">
                <TableCell className="font-medium text-slate-300 sticky left-0 bg-slate-800/80 backdrop-blur-sm">
                  Team & Matchup
                </TableCell>
                {props.map((prop) => (
                  <TableCell key={prop.prop_id} className="text-center">
                    <div className="space-y-1">
                      <div className="text-white font-medium">{prop.team}</div>
                      <div className="text-slate-400 text-sm">vs {prop.against_team}</div>
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              {/* Prop Details Row */}
              <TableRow className="border-slate-700">
                <TableCell className="font-medium text-slate-300 sticky left-0 bg-slate-800/80 backdrop-blur-sm">
                  Prop Details
                </TableCell>
                {props.map((prop) => (
                  <TableCell key={prop.prop_id} className="text-center">
                    <div className="space-y-2">
                      <div className="text-blue-400 font-medium">{prop.stat_type}</div>
                      <div className="text-white text-xl font-bold">{prop.line_score}</div>
                      <div className="flex items-center justify-center gap-2">
                        {prop.odds_type === 'goblin' && (
                          <img 
                            src="/goblin_updated.png" 
                            alt="Goblin" 
                            className="w-6 h-6 rounded-full object-cover"
                            onError={(e) => {
                              // Fallback if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        )}
                        {prop.odds_type === 'demon' && (
                          <img 
                            src="/demon.png" 
                            alt="Demon" 
                            className="w-6 h-6 rounded-full object-cover"
                            onError={(e) => {
                              // Fallback if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        )}
                        <Badge variant={getOddsBadgeVariant(prop.odds_type)}>
                          {prop.odds_type}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              {/* Scoring Metrics Row */}
              <TableRow className="border-slate-700">
                <TableCell className="font-medium text-slate-300 sticky left-0 bg-slate-800/80 backdrop-blur-sm">
                  Scoring Metrics
                </TableCell>
                {props.map((prop) => (
                  <TableCell key={prop.prop_id} className="text-center">
                    <div className="space-y-2">
                      <div className={`text-2xl font-bold ${getScoreColor(prop.sorting_score_computed || prop.sorting_score)}`}>
                        {(prop.sorting_score_computed || prop.sorting_score).toFixed(3)}
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="text-slate-400">
                          H2H: {(prop.h2h_score_computed || prop.h2h_score).toFixed(3)}
                        </div>
                        <div className="text-slate-400">
                          L5: {(prop.l5_score_computed || prop.l5_score).toFixed(3)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              {/* Historical Performance (H2H) Row */}
              <TableRow className="border-slate-700">
                <TableCell className="font-medium text-slate-300 sticky left-0 bg-slate-800/80 backdrop-blur-sm">
                  Historical vs Opponent
                </TableCell>
                {props.map((prop) => (
                  <TableCell key={prop.prop_id} className="text-center">
                    <div className="space-y-2">
                      <div className="text-white font-semibold">
                        Avg: {prop.h2h_avg.toFixed(1)}
                      </div>
                      <div className="text-slate-400 text-sm">
                        ({prop.h2h_array?.length || 0} games)
                      </div>
                      <div className="flex flex-wrap justify-center gap-1">
                        {formatGameResults(prop.h2h_array || [], prop.line_score)}
                      </div>
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              {/* Recent Form (L5) Row */}
              <TableRow className="border-slate-700">
                <TableCell className="font-medium text-slate-300 sticky left-0 bg-slate-800/80 backdrop-blur-sm">
                  Recent Form (L5)
                </TableCell>
                {props.map((prop) => (
                  <TableCell key={prop.prop_id} className="text-center">
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-white font-semibold">
                          Avg: {prop.l5_avg.toFixed(1)}
                        </span>
                        {getTrendIcon(prop.l5_avg, prop.h2h_avg)}
                      </div>
                      <div className="text-slate-400 text-sm">
                        ({prop.l5_array?.length || 0} games)
                      </div>
                      <div className="flex flex-wrap justify-center gap-1">
                        {formatGameResults(prop.l5_array || [], prop.line_score)}
                      </div>
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              {/* Sample Sizes Row */}
              <TableRow className="border-slate-700">
                <TableCell className="font-medium text-slate-300 sticky left-0 bg-slate-800/80 backdrop-blur-sm">
                  Sample Sizes
                </TableCell>
                {props.map((prop) => (
                  <TableCell key={prop.prop_id} className="text-center">
                    <div className="space-y-1 text-sm">
                      <div className="text-white">H2H: {prop.h2h_array?.length || 0} games</div>
                      <div className="text-white">L5: {prop.l5_array?.length || 0} games</div>
                      <div className={`text-xs ${(prop.sample_size || 0) >= 5 ? 'text-green-400' : 'text-yellow-400'}`}>
                        Quality: {(prop.sample_size || 0) >= 5 ? 'Good' : 'Limited'}
                      </div>
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              {/* Additional Metrics Row */}
              <TableRow className="border-slate-700">
                <TableCell className="font-medium text-slate-300 sticky left-0 bg-slate-800/80 backdrop-blur-sm">
                  Additional Metrics
                </TableCell>
                {props.map((prop) => (
                  <TableCell key={prop.prop_id} className="text-center">
                    <div className="space-y-1 text-sm">
                      {prop.matchup_rank && (
                        <div className="text-white">Matchup Rank: {prop.matchup_rank}</div>
                      )}
                      <div className="text-slate-400">
                        H2H Hit Rate: {calculateHitRate(prop.h2h_array || [], prop.line_score).toFixed(1)}%
                      </div>
                      <div className="text-slate-400">
                        L5 Hit Rate: {calculateHitRate(prop.l5_array || [], prop.line_score).toFixed(1)}%
                      </div>
                      {prop.h2h_percent_computed && (
                        <div className="text-slate-400">H2H %: {(prop.h2h_percent_computed * 100).toFixed(1)}%</div>
                      )}
                      {prop.l5_percent_computed && (
                        <div className="text-slate-400">L5 %: {(prop.l5_percent_computed * 100).toFixed(1)}%</div>
                      )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Player Details Dialog */}
      {selectedPlayer && (
        <Dialog open={!!selectedPlayer} onOpenChange={() => setSelectedPlayer(null)}>
          <PlayerDetailDialog prop={selectedPlayer} />
        </Dialog>
      )}
    </Card>
  );
};
