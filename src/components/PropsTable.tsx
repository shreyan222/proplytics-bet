
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Filter } from 'lucide-react';
import { Prop, PropFilters } from '@/types/nba';

interface PropsTableProps {
  props: Prop[];
  filters: PropFilters;
  onFiltersChange: (filters: PropFilters) => void;
}

export const PropsTable: React.FC<PropsTableProps> = ({ props, filters, onFiltersChange }) => {
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>NBA Props Analysis</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Badge variant="secondary">{props.length} props</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader column="player_name">Player</SortableHeader>
                <TableHead>Position</TableHead>
                <TableHead>Teams</TableHead>
                <SortableHeader column="stat_type">Stat</SortableHeader>
                <SortableHeader column="line_score">Line</SortableHeader>
                <TableHead>Odds</TableHead>
                <TableHead>H2H Array</TableHead>
                <TableHead>L5 Array</TableHead>
                <SortableHeader column="h2h_avg">H2H Avg</SortableHeader>
                <SortableHeader column="l5_avg">L5 Avg</SortableHeader>
                <SortableHeader column="sample_size">Sample</SortableHeader>
                <SortableHeader column="sorting_score">Score</SortableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProps.map((prop, index) => (
                <TableRow key={`${prop.prop_id}-${index}`}>
                  <TableCell className="font-medium">{prop.player_name}</TableCell>
                  <TableCell>{prop.position}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{prop.team} vs {prop.against_team}</div>
                    </div>
                  </TableCell>
                  <TableCell>{prop.stat_type}</TableCell>
                  <TableCell className="font-mono">{prop.line_score}</TableCell>
                  <TableCell>
                    <Badge className={getOddsColor(prop.odds_type)}>
                      {prop.odds_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {JSON.stringify(prop.h2h_array)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {JSON.stringify(prop.l5_array)}
                  </TableCell>
                  <TableCell className="font-mono">{prop.h2h_avg}</TableCell>
                  <TableCell className="font-mono">{prop.l5_avg}</TableCell>
                  <TableCell>{prop.sample_size}</TableCell>
                  <TableCell className="font-mono font-semibold">
                    {prop.sorting_score}
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
