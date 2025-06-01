
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Prop } from '@/types/nba';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ComparisonTableProps {
  props: Prop[];
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ props }) => {
  const getScoreColor = (score: number) => {
    if (score >= 0.875) return 'text-green-400';
    if (score >= 0.75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getOddsBadgeVariant = (oddsType: string) => {
    switch (oddsType) {
      case 'goblin': return 'destructive';
      case 'demon': return 'default';
      default: return 'secondary';
    }
  };

  const formatGameResults = (games: number[], line: number) => {
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
                    <div className="space-y-1">
                      <div className="text-white font-semibold">{prop.player_name}</div>
                      <div className="text-slate-400 text-sm">{prop.position}</div>
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
                      <Badge variant={getOddsBadgeVariant(prop.odds_type)}>
                        {prop.odds_type}
                      </Badge>
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
                      <div className={`text-2xl font-bold ${getScoreColor(prop.sorting_score)}`}>
                        {prop.sorting_score.toFixed(3)}
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="text-slate-400">H2H: {prop.h2h_score.toFixed(3)}</div>
                        <div className="text-slate-400">L5: {prop.l5_score.toFixed(3)}</div>
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
                        ({prop.h2h_array.length} games)
                      </div>
                      <div className="flex flex-wrap justify-center gap-1">
                        {formatGameResults(prop.h2h_array, prop.line_score)}
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
                        ({prop.l5_array.length} games)
                      </div>
                      <div className="flex flex-wrap justify-center gap-1">
                        {formatGameResults(prop.l5_array, prop.line_score)}
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
                      <div className="text-white">H2H: {prop.h2h_array.length} games</div>
                      <div className="text-white">L5: {prop.l5_array.length} games</div>
                      <div className={`text-xs ${prop.sample_size >= 5 ? 'text-green-400' : 'text-yellow-400'}`}>
                        Quality: {prop.sample_size >= 5 ? 'Good' : 'Limited'}
                      </div>
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
