
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PropFilters } from '@/types/nba';
import { X, Filter } from 'lucide-react';

interface PropsFiltersProps {
  filters: PropFilters;
  onFiltersChange: (filters: PropFilters) => void;
  totalProps: number;
  filteredProps: number;
}

export const PropsFilters: React.FC<PropsFiltersProps> = ({
  filters,
  onFiltersChange,
  totalProps,
  filteredProps
}) => {
  const statTypes = [
    'Points', 'Rebounds', 'Assists', 'Pts+Rebs', 'Pts+Asts', 'Rebs+Asts',
    'Pts+Rebs+Asts', 'Steals', 'Blocked Shots', 'Turnovers', 'Blks+Stls',
    '3-PT Made', 'Fantasy Points'
  ];

  const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
  
  const teams = [
    'ATL', 'BOS', 'BRK', 'CHA', 'CHI', 'CLE', 'DAL', 'DEN', 'DET', 'GSW',
    'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA', 'MIL', 'MIN', 'NOP', 'NYK',
    'OKC', 'ORL', 'PHI', 'PHX', 'POR', 'SAC', 'SAS', 'TOR', 'UTA', 'WAS'
  ];

  const updateFilter = (key: keyof PropFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const addToArrayFilter = (key: keyof PropFilters, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    if (!currentArray.includes(value)) {
      updateFilter(key, [...currentArray, value]);
    }
  };

  const removeFromArrayFilter = (key: keyof PropFilters, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    updateFilter(key, currentArray.filter(item => item !== value));
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredProps} of {totalProps} props
          </Badge>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Range */}
        <div className="space-y-2">
          <Label>Score Range</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min score"
              value={filters.min_score || ''}
              onChange={(e) => updateFilter('min_score', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-24"
              step="0.001"
              min="0"
              max="1"
            />
            <Input
              type="number"
              placeholder="Max score"
              value={filters.max_score || ''}
              onChange={(e) => updateFilter('max_score', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-24"
              step="0.001"
              min="0"
              max="1"
            />
          </div>
        </div>

        {/* Sample Size */}
        <div className="space-y-2">
          <Label>Minimum Sample Size</Label>
          <Input
            type="number"
            placeholder="Min games"
            value={filters.min_sample_size || ''}
            onChange={(e) => updateFilter('min_sample_size', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-32"
            min="1"
            max="50"
          />
        </div>

        {/* Odds Types */}
        <div className="space-y-2">
          <Label>Categories</Label>
          <div className="flex flex-wrap gap-2">
            {(['standard', 'demon', 'goblin'] as const).map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`odds-${type}`}
                  checked={(filters.odds_types || []).includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      addToArrayFilter('odds_types', type);
                    } else {
                      removeFromArrayFilter('odds_types', type);
                    }
                  }}
                />
                <Label htmlFor={`odds-${type}`} className="capitalize">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Stat Types */}
        <div className="space-y-2">
          <Label>Stat Types</Label>
          <Select onValueChange={(value) => addToArrayFilter('stat_types', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Add stat type" />
            </SelectTrigger>
            <SelectContent>
              {statTypes.map((stat) => (
                <SelectItem key={stat} value={stat}>
                  {stat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-1 mt-2">
            {(filters.stat_types || []).map((stat) => (
              <Badge key={stat} variant="secondary" className="text-xs">
                {stat}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeFromArrayFilter('stat_types', stat)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Teams */}
        <div className="space-y-2">
          <Label>Teams</Label>
          <Select onValueChange={(value) => addToArrayFilter('teams', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Add team" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-1 mt-2">
            {(filters.teams || []).map((team) => (
              <Badge key={team} variant="secondary" className="text-xs">
                {team}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeFromArrayFilter('teams', team)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Positions */}
        <div className="space-y-2">
          <Label>Positions</Label>
          <div className="flex flex-wrap gap-2">
            {positions.map((position) => (
              <div key={position} className="flex items-center space-x-2">
                <Checkbox
                  id={`pos-${position}`}
                  checked={(filters.positions || []).includes(position)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      addToArrayFilter('positions', position);
                    } else {
                      removeFromArrayFilter('positions', position);
                    }
                  }}
                />
                <Label htmlFor={`pos-${position}`}>
                  {position}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
