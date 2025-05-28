
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Clock } from 'lucide-react';
import { Prop } from '@/types/nba';

interface PropsTableProps {
  props: Prop[];
}

export const PropsTable: React.FC<PropsTableProps> = ({ props }) => {
  const [sortBy, setSortBy] = useState<keyof Prop>('sorting_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: keyof Prop) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const sortedProps = [...props].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    const aStr = String(aVal);
    const bStr = String(bVal);
    return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  const getOddsColor = (oddsType: string) => {
    switch (oddsType) {
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'demon': return 'bg-orange-100 text-orange-800';
      case 'goblin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatArray = (arr: number[]) => {
    if (!Array.isArray(arr) || arr.length === 0) return '[]';
    return `[${arr.join(', ')}]`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.875) return 'text-red-600 font-bold'; // Goblin
    if (score >= 0.75) return 'text-orange-600 font-semibold'; // Demon  
    return 'text-blue-600'; // Standard
  };

  const formatGameTime = (startTime: string) => {
    if (!startTime) return 'TBD';
    const date = new Date(startTime);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const SortableHeader = ({ column, children }: { column: keyof Prop; children: React.ReactNode }) => (
    <TableHead>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 data-[state=open]:bg-accent"
        onClick={() => handleSort(column)}
      >
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

  if (props.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>NBA Props Analysis</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No props match your current filters</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>NBA Props Analysis</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{props.length} props</Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader column="player_name">Player</SortableHeader>
                <TableHead>Position</TableHead>
                <TableHead>Matchup</TableHead>
                <TableHead>Game Time</TableHead>
                <SortableHeader column="stat_type">Stat</SortableHeader>
                <SortableHeader column="line_score">Line</SortableHeader>
                <TableHead>Category</TableHead>
                <TableHead>H2H Data</TableHead>
                <TableHead>L5 Data</TableHead>
                <SortableHeader column="h2h_avg">H2H Avg</SortableHeader>
                <SortableHeader column="l5_avg">L5 Avg</SortableHeader>
                <SortableHeader column="h2h_score">H2H Hit %</SortableHeader>
                <SortableHeader column="l5_score">L5 Hit %</SortableHeader>
                <SortableHeader column="sample_size">Sample</SortableHeader>
                <SortableHeader column="sorting_score">Final Score</SortableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProps.map((prop, index) => (
                <TableRow key={`${prop.prop_id}-${index}`} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{prop.player_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{prop.position}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{prop.team} vs {prop.against_team}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatGameTime(prop.start_time)}
                  </TableCell>
                  <TableCell className="font-medium">{prop.stat_type}</TableCell>
                  <TableCell className="font-mono font-semibold">{prop.line_score}</TableCell>
                  <TableCell>
                    <Badge className={getOddsColor(prop.odds_type)}>
                      {prop.odds_type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs max-w-32">
                    <div className="truncate" title={formatArray(prop.h2h_array)}>
                      {formatArray(prop.h2h_array)}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs max-w-32">
                    <div className="truncate" title={formatArray(prop.l5_array)}>
                      {formatArray(prop.l5_array)}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{prop.h2h_avg.toFixed(1)}</TableCell>
                  <TableCell className="font-mono">{prop.l5_avg.toFixed(1)}</TableCell>
                  <TableCell className={`font-mono ${getScoreColor(prop.h2h_score)}`}>
                    {(prop.h2h_score * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className={`font-mono ${getScoreColor(prop.l5_score)}`}>
                    {(prop.l5_score * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="font-mono">{prop.sample_size}</TableCell>
                  <TableCell className={`font-mono font-bold ${getScoreColor(prop.sorting_score)}`}>
                    {prop.sorting_score.toFixed(3)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
