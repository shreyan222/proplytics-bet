import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, ChevronDown, ChevronRight, User, Target, TrendingUp } from 'lucide-react';
import { useNormalizedSearch } from '@/hooks/useNormalizedSearch';
import { NormalizedProp, GroupedProps } from '@/types/nba';
import { cn } from '@/lib/utils';

export const NormalizedSearch: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    searchResults,
    playerSuggestions,
    availableFilters,
    isLoading,
    error,
    updateFilters,
    clearFilters,
    totalResults,
    hasResults,
    hasFilters
  } = useNormalizedSearch();

  const [showFilters, setShowFilters] = useState(false);
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());

  // Toggle player expansion
  const togglePlayer = (playerName: string) => {
    const newExpanded = new Set(expandedPlayers);
    if (newExpanded.has(playerName)) {
      newExpanded.delete(playerName);
    } else {
      newExpanded.add(playerName);
    }
    setExpandedPlayers(newExpanded);
  };

  // Handle suggestion click
  const handleSuggestionClick = (playerName: string) => {
    setSearchQuery(playerName);
  };

  // Get prop type icon
  const getPropTypeIcon = (propType: string) => {
    if (propType.toLowerCase().includes('pass')) return '🏈';
    if (propType.toLowerCase().includes('rush')) return '🏃';
    if (propType.toLowerCase().includes('receiv')) return '🤲';
    if (propType.toLowerCase().includes('td')) return '🎯';
    if (propType.toLowerCase().includes('yard')) return '📏';
    return '⚽';
  };

  // Get odd type badge variant
  const getOddTypeBadgeVariant = (oddType: string) => {
    switch (oddType) {
      case 'Demon': return 'destructive';
      case 'Goblin': return 'default';
      case 'Alt Lines': return 'secondary';
      default: return 'outline';
    }
  };

  // Get odd type badge color
  const getOddTypeBadgeColor = (oddType: string) => {
    switch (oddType) {
      case 'Demon': return 'bg-red-600 hover:bg-red-700 text-white';
      case 'Goblin': return 'bg-green-600 hover:bg-green-700 text-white';
      case 'Alt Lines': return 'bg-purple-600 hover:bg-purple-700 text-white';
      default: return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  // Render individual prop
  const renderProp = (prop: NormalizedProp) => (
    <div key={prop.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700 hover:bg-slate-700/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{getPropTypeIcon(prop.prop_type)}</div>
        <div>
          <div className="text-white font-medium">{prop.prop_type}</div>
          <div className="text-sm text-slate-400">
            {prop.team} vs {prop.opponent}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-sm text-slate-400">Line</div>
          <div className="text-xl font-bold text-blue-400">{prop.line}</div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-slate-400">Odds</div>
          <div className="text-lg font-semibold text-white">{prop.odds}</div>
        </div>

        {prop.sorting_score && (
          <div className="text-center">
            <div className="text-sm text-slate-400">Score</div>
            <div className="text-lg font-semibold text-green-400">
              {prop.sorting_score.toFixed(3)}
            </div>
          </div>
        )}

        <Badge 
          variant={getOddTypeBadgeVariant(prop.odd_type)}
          className={getOddTypeBadgeColor(prop.odd_type)}
        >
          {prop.odd_type}
        </Badge>
      </div>
    </div>
  );

  // Render prop type group
  const renderPropTypeGroup = (propType: string, oddTypes: Record<string, NormalizedProp[]>) => (
    <Accordion type="single" collapsible key={propType}>
      <AccordionItem value={propType} className="border-slate-700">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <span className="text-xl">{getPropTypeIcon(propType)}</span>
            <span className="text-white font-semibold">{propType}</span>
            <Badge variant="secondary" className="ml-2">
              {Object.values(oddTypes).reduce((sum, props) => sum + props.length, 0)} props
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 pt-3">
            {Object.entries(oddTypes).map(([oddType, props]) => (
              <div key={oddType} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={getOddTypeBadgeVariant(oddType)} className={getOddTypeBadgeColor(oddType)}>
                    {oddType}
                  </Badge>
                  <span className="text-sm text-slate-400">({props.length} props)</span>
                </div>
                <div className="space-y-2 ml-4">
                  {props.map(renderProp)}
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  // Render player group
  const renderPlayerGroup = (group: GroupedProps) => (
    <Card key={group.player} className="glass-card border border-slate-700">
      <CardHeader 
        className="cursor-pointer hover:bg-slate-700/30 transition-colors"
        onClick={() => togglePlayer(group.player)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-blue-400" />
            <div>
              <CardTitle className="text-white text-xl">{group.player}</CardTitle>
              <div className="text-slate-400 text-sm">
                {group.total_props} total props • {Object.keys(group.prop_types).length} prop types
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              {group.total_props} props
            </Badge>
            {expandedPlayers.has(group.player) ? (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-slate-400" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {expandedPlayers.has(group.player) && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {Object.entries(group.prop_types).map(([propType, oddTypes]) =>
              renderPropTypeGroup(propType, oddTypes)
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="glass-card border border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-400" />
            Search Props by Player
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by player name (e.g., 'Caleb Williams', 'LeBron James')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 h-12"
            />
            
            {/* Player Suggestions */}
            {playerSuggestions.length > 0 && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 glass-card border border-slate-600 rounded-lg max-h-60 overflow-y-auto z-50">
                {playerSuggestions.map((player) => (
                  <div
                    key={player}
                    className="p-3 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 transition-colors cursor-pointer"
                    onClick={() => handleSuggestionClick(player)}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-400" />
                      <span className="text-white">{player}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
            
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-400 hover:text-red-300 hover:bg-red-600/20"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-600">
              {/* Prop Type Filter */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Prop Type</label>
                <Select
                  value={filters.prop_type?.[0] || ''}
                  onValueChange={(value) => updateFilters({ prop_type: value ? [value] : undefined })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="All Prop Types" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="">All Prop Types</SelectItem>
                    {availableFilters.prop_types.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Odd Type Filter */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Odd Type</label>
                <Select
                  value={filters.odd_type?.[0] || ''}
                  onValueChange={(value) => updateFilters({ odd_type: value ? [value] : undefined })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="All Odd Types" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="">All Odd Types</SelectItem>
                    {availableFilters.odd_types.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Team Filter */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Team</label>
                <Select
                  value={filters.team?.[0] || ''}
                  onValueChange={(value) => updateFilters({ team: value ? [value] : undefined })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="All Teams" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="">All Teams</SelectItem>
                    {availableFilters.teams.map((team) => (
                      <SelectItem key={team} value={team}>{team}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* League Filter */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">League</label>
                <Select
                  value={filters.league?.[0] || ''}
                  onValueChange={(value) => updateFilters({ league: value ? [value] : undefined })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="All Leagues" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="">All Leagues</SelectItem>
                    {availableFilters.leagues.map((league) => (
                      <SelectItem key={league} value={league}>{league}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="space-y-4">
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <div className="text-white">
              {hasResults ? (
                <span>Found {totalResults} props for "{searchQuery}"</span>
              ) : (
                <span>No props found for "{searchQuery}"</span>
              )}
            </div>
            
            {hasFilters && (
              <div className="text-sm text-slate-400">
                Filters applied: {Object.keys(filters).length}
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Searching props...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="glass-card border border-red-600">
              <CardContent className="p-6 text-center">
                <p className="text-red-400 mb-4">Error searching props: {error.message}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {!isLoading && !error && hasResults && (
            <div className="space-y-4">
              {searchResults.map(renderPlayerGroup)}
            </div>
          )}

          {/* No Results */}
          {!isLoading && !error && !hasResults && searchQuery.trim() && (
            <Card className="glass-card border border-slate-700">
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No props found</h3>
                <p className="text-slate-400 mb-4">
                  No props found for "{searchQuery}". Try adjusting your search or filters.
                </p>
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Search Instructions */}
      {!searchQuery.trim() && (
        <Card className="glass-card border border-slate-700">
          <CardContent className="p-8 text-center">
            <Search className="h-16 w-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Search for Player Props</h3>
            <p className="text-slate-400 mb-4">
              Enter a player name above to see all available props grouped by type and odds category.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-500">
              <div>
                <div className="font-medium text-slate-300 mb-1">Example Searches</div>
                <div>• Caleb Williams</div>
                <div>• LeBron James</div>
                <div>• Josh Allen</div>
              </div>
              <div>
                <div className="font-medium text-slate-300 mb-1">Prop Types</div>
                <div>• Passing Yards</div>
                <div>• Rushing TDs</div>
                <div>• Receiving Yards</div>
              </div>
              <div>
                <div className="font-medium text-slate-300 mb-1">Odds Categories</div>
                <div>• Standard</div>
                <div>• Alt Lines</div>
                <div>• Goblin/Demon</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
