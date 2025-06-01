import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X, Filter, Table, Grid, RefreshCw } from 'lucide-react';
import { PropFilters } from '@/types/nba';

interface PropsFiltersProps {
  filters: PropFilters;
  onFiltersChange: (filters: PropFilters) => void;
  onClearFilters: () => void;
  totalProps: number;
  filteredProps: number;
  onViewModeChange?: (mode: 'table' | 'cards') => void;
  viewMode?: 'table' | 'cards';
  onRefresh?: () => void;
  isRefreshing?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const NBA_TEAMS = [
  'ATL', 'BOS', 'BKN', 'CHA', 'CHI', 'CLE', 'DAL', 'DEN', 'DET', 'GSW',
  'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA', 'MIL', 'MIN', 'NOP', 'NYK',
  'OKC', 'ORL', 'PHI', 'PHX', 'POR', 'SAC', 'SAS', 'TOR', 'UTA', 'WAS'
];

const STAT_TYPES = [
  'Points', 'Rebounds', 'Assists', 'Steals', 'Blocks', '3-Pointers Made',
  'Field Goals Made', 'Free Throws Made', 'Turnovers', 'Double-Double'
];

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];

const ODDS_TYPES = [
  { value: 'standard', label: 'Standard' },
  { value: 'demon', label: 'Demon' },
  { value: 'goblin', label: 'Goblin' }
];

export const PropsFilters: React.FC<PropsFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  totalProps,
  filteredProps,
  onViewModeChange,
  viewMode = 'table',
  onRefresh,
  isRefreshing = false,
  searchQuery = '',
  onSearchChange,
}) => {
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  React.useEffect(() => {
    const count = Object.values(filters).filter(value => 
      value !== undefined && value !== null && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
    setActiveFiltersCount(count);
  }, [filters]);

  const handleFilterChange = (key: keyof PropFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const removeFilter = (key: keyof PropFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  return (
    <Card className="mb-6 bg-card border-border">
      <CardContent className="p-6">
        {/* Top Control Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
          {/* Left Side - Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by player name, team, or stat type..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 bg-background text-foreground placeholder:text-muted-foreground border-border"
            />
          </div>

          {/* Right Side - View Toggle & Refresh */}
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="text-foreground border-border hover:bg-muted"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
            
            {onViewModeChange && (
              <div className="flex border border-border rounded-lg p-1 bg-background">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('table')}
                  className={`px-3 ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Table className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('cards')}
                  className={`px-3 ${viewMode === 'cards' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
          {/* Team Filter */}
          <Select onValueChange={(value) => handleFilterChange('teams', [value])}>
            <SelectTrigger className="bg-background text-foreground border-border">
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent>
              {NBA_TEAMS.map((team) => (
                <SelectItem key={team} value={team} className="text-foreground hover:bg-muted">{team}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Stat Type Filter */}
          <Select onValueChange={(value) => handleFilterChange('stat_types', [value])}>
            <SelectTrigger className="bg-background text-foreground border-border">
              <SelectValue placeholder="Stat Type" />
            </SelectTrigger>
            <SelectContent>
              {STAT_TYPES.map((stat) => (
                <SelectItem key={stat} value={stat} className="text-foreground hover:bg-muted">{stat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Odds Type Filter */}
          <Select onValueChange={(value) => handleFilterChange('odds_types', [value])}>
            <SelectTrigger className="bg-background text-foreground border-border">
              <SelectValue placeholder="Odds Type" />
            </SelectTrigger>
            <SelectContent>
              {ODDS_TYPES.map((odds) => (
                <SelectItem key={odds.value} value={odds.value} className="text-foreground hover:bg-muted">{odds.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Position Filter */}
          <Select onValueChange={(value) => handleFilterChange('positions', [value])}>
            <SelectTrigger className="bg-background text-foreground border-border">
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent>
              {POSITIONS.map((position) => (
                <SelectItem key={position} value={position} className="text-foreground hover:bg-muted">{position}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={onClearFilters}
            disabled={activeFiltersCount === 0}
            className="flex items-center gap-2 text-foreground border-border hover:bg-muted"
          >
            <Filter className="h-4 w-4" />
            Clear
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-muted text-muted-foreground">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.teams?.map((team) => (
              <Badge key={`team-${team}`} variant="secondary" className="flex items-center gap-1 bg-muted text-muted-foreground hover:bg-muted/80">
                Team: {team}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('teams')}
                />
              </Badge>
            ))}
            {filters.stat_types?.map((stat) => (
              <Badge key={`stat-${stat}`} variant="secondary" className="flex items-center gap-1 bg-muted text-muted-foreground hover:bg-muted/80">
                Stat: {stat}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('stat_types')}
                />
              </Badge>
            ))}
            {filters.odds_types?.map((odds) => (
              <Badge key={`odds-${odds}`} variant="secondary" className="flex items-center gap-1 bg-muted text-muted-foreground hover:bg-muted/80">
                Odds: {odds}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('odds_types')}
                />
              </Badge>
            ))}
            {filters.positions?.map((position) => (
              <Badge key={`pos-${position}`} variant="secondary" className="flex items-center gap-1 bg-muted text-muted-foreground hover:bg-muted/80">
                Position: {position}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('positions')}
                />
              </Badge>
            ))}
          </div>
        )}

        {/* Results Counter */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredProps} of {totalProps} props
        </div>
      </CardContent>
    </Card>
  );
};
