
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
  locked?: boolean;
  onViewModeChange?: (mode: 'table' | 'cards') => void;
  viewMode?: 'table' | 'cards';
  onRefresh?: () => void;
  isRefreshing?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedLeague?: 'NBA' | 'NFL';
  allProps?: any[]; // Add this to receive the actual props data
}

// Helper function to get unique values from props data
const getUniqueValues = (props: any[], field: string): string[] => {
  if (!props || props.length === 0) return [];
  
  // Handle potential field name variations
  const fieldVariations = [field, field.toLowerCase(), field.replace('_', '')];
  
  let values: any[] = [];
  for (const prop of props) {
    for (const fieldVar of fieldVariations) {
      if (prop[fieldVar] !== undefined && prop[fieldVar] !== null) {
        values.push(prop[fieldVar]);
        break;
      }
    }
  }
  
  // Filter out empty/null values and return unique sorted values
  return [...new Set(values.filter(Boolean))].sort();
};



export const PropsFilters: React.FC<PropsFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  totalProps,
  filteredProps,
  locked = false,
  onViewModeChange,
  viewMode = 'table',
  onRefresh,
  isRefreshing = false,
  searchQuery = '',
  onSearchChange,
  selectedLeague = 'NBA',
  allProps = [],
}) => {
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Generate dynamic filter options from actual props data
  const availableTeams = getUniqueValues(allProps, 'team');
  const availablePositions = getUniqueValues(allProps, 'position');
  const availableStatTypes = getUniqueValues(allProps, 'stat_type');
  const availableOddsTypes = getUniqueValues(allProps, 'odds_type');
  
  // Get unique sample sizes (convert to numbers and sort)
  const availableSampleSizes = React.useMemo(() => {
    if (!allProps || allProps.length === 0) return [];
    const sizes = allProps
      .map(prop => {
        const size = prop.sample_size ?? prop.sampleSize;
        return typeof size === 'number' ? size : parseInt(size, 10);
      })
      .filter(size => !isNaN(size) && size > 0);
    return [...new Set(sizes)].sort((a, b) => a - b);
  }, [allProps]);

  // Debug logging to see what filter options are available
  React.useEffect(() => {
  }, [allProps, availableTeams, availablePositions, availableStatTypes, availableOddsTypes, availableSampleSizes]);

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
        {locked && (
          <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
            Subscribe to view all props and unlock filters.
          </div>
        )}
        {/* Top Control Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
          {/* Left Side - Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={`Search by player name, team, or stat type...`}
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
         {allProps.length === 0 ? (
           <div className="text-center py-8 text-muted-foreground">
             <p>No props data available. Filters will appear once data is loaded.</p>
           </div>
         ) : (
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
           {/* Team Filter */}
           <Select disabled={locked} onValueChange={(value) => handleFilterChange('teams', [value])}>
             <SelectTrigger className="bg-background text-foreground border-border">
               <SelectValue placeholder="Team" />
             </SelectTrigger>
             <SelectContent>
               {availableTeams.length > 0 ? (
                 availableTeams.map((team) => (
                   <SelectItem key={team} value={team} className="text-foreground hover:bg-muted">{team}</SelectItem>
                 ))
               ) : (
+                <SelectItem value="__no_teams" disabled className="text-muted-foreground">No teams available</SelectItem>
               )}
             </SelectContent>
           </Select>
 
           {/* Stat Type Filter */}
           <Select disabled={locked} onValueChange={(value) => handleFilterChange('stat_types', [value])}>
             <SelectTrigger className="bg-background text-foreground border-border">
               <SelectValue placeholder="Stat Type" />
             </SelectTrigger>
             <SelectContent>
               {availableStatTypes.length > 0 ? (
                 availableStatTypes.map((stat) => (
                   <SelectItem key={stat} value={stat} className="text-foreground hover:bg-muted">{stat}</SelectItem>
                 ))
               ) : (
+                <SelectItem value="__no_stats" disabled className="text-muted-foreground">No stat types available</SelectItem>
               )}
             </SelectContent>
           </Select>
 
           {/* Odds Type Filter */}
           <Select disabled={locked} onValueChange={(value) => handleFilterChange('odds_types', [value])}>
             <SelectTrigger className="bg-background text-foreground border-border">
               <SelectValue placeholder="Odds Type" />
             </SelectTrigger>
             <SelectContent>
               {availableOddsTypes.length > 0 ? (
                 availableOddsTypes.map((odds) => (
                   <SelectItem key={odds} value={odds} className="text-foreground hover:bg-muted">{odds}</SelectItem>
                 ))
               ) : (
+                <SelectItem value="__no_odds" disabled className="text-muted-foreground">No odds types available</SelectItem>
               )}
             </SelectContent>
           </Select>
 
           {/* Position Filter */}
           <Select disabled={locked} onValueChange={(value) => handleFilterChange('positions', [value])}>
             <SelectTrigger className="bg-background text-foreground border-border">
               <SelectValue placeholder="Position" />
             </SelectTrigger>
             <SelectContent>
               {availablePositions.length > 0 ? (
                 availablePositions.map((position) => (
                   <SelectItem key={position} value={position} className="text-foreground hover:bg-muted">{position}</SelectItem>
                 ))
               ) : (
+                <SelectItem value="__no_positions" disabled className="text-muted-foreground">No positions available</SelectItem>
               )}
             </SelectContent>
           </Select>
 
           {/* Sample Size Filter */}
           <Select disabled={locked} onValueChange={(value) => handleFilterChange('sample_sizes', [parseInt(value, 10)])}>
             <SelectTrigger className="bg-background text-foreground border-border">
               <SelectValue placeholder="Sample Size" />
             </SelectTrigger>
             <SelectContent>
               {availableSampleSizes.length > 0 ? (
                 availableSampleSizes.map((size) => (
                   <SelectItem key={size} value={size.toString()} className="text-foreground hover:bg-muted">{size}</SelectItem>
                 ))
               ) : (
+                <SelectItem value="__no_samples" disabled className="text-muted-foreground">No sample sizes available</SelectItem>
               )}
             </SelectContent>
           </Select>
 
           {/* Clear Filters */}
           <Button
             variant="outline"
             onClick={onClearFilters}
             disabled={locked || activeFiltersCount === 0}
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
         )}
 
        {/* Active Filters */}
        {!locked && activeFiltersCount > 0 && (
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
            {filters.sample_sizes?.map((size) => (
              <Badge key={`size-${size}`} variant="secondary" className="flex items-center gap-1 bg-muted text-muted-foreground hover:bg-muted/80">
                Sample Size: {size}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('sample_sizes')}
                />
              </Badge>
            ))}
          </div>
        )}

        {/* Results Counter */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredProps} of {totalProps} props
        </div>

        {/* Filter Options Summary */}
        {allProps.length > 0 && (
          <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
            <p>Available filters: {availableTeams.length} teams, {availablePositions.length} positions, {availableStatTypes.length} stat types, {availableOddsTypes.length} odds types, {availableSampleSizes.length} sample sizes</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
