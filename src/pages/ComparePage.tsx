
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePropsData } from '@/hooks/usePropsData';
import { Prop } from '@/types/nba';
import { Search, X, GitCompare, Download, Share2 } from 'lucide-react';
import { ComparisonTable } from '@/components/ComparisonTable';
import { useDebounce } from '@/hooks/useDebounce';

export const ComparePage: React.FC = () => {
  const { data: props = [], isLoading } = usePropsData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProps, setSelectedProps] = useState<Prop[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const searchResults = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return [];
    
    const query = debouncedSearchQuery.toLowerCase();
    return props
      .filter(prop => {
        return (
          prop.player_name.toLowerCase().includes(query) ||
          prop.team.toLowerCase().includes(query) ||
          prop.against_team.toLowerCase().includes(query) ||
          prop.stat_type.toLowerCase().includes(query)
        );
      })
      .slice(0, 10)
      .sort((a, b) => b.sorting_score - a.sorting_score);
  }, [props, debouncedSearchQuery]);

  const handleAddProp = (prop: Prop) => {
    if (selectedProps.length < 4 && !selectedProps.find(p => p.prop_id === prop.prop_id)) {
      setSelectedProps([...selectedProps, prop]);
      setSearchQuery('');
      setShowDropdown(false);
    }
  };

  const handleRemoveProp = (propId: string) => {
    setSelectedProps(selectedProps.filter(p => p.prop_id !== propId));
  };

  const handleExport = () => {
    // Implementation for CSV export
    console.log('Exporting comparison...');
  };

  const handleShare = () => {
    // Implementation for sharing
    console.log('Sharing comparison...');
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-10 w-80 h-80 bg-blue-600 opacity-15 rounded-full blur-2xl animate-ping" />
        
        <div className="relative z-10 container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="relative">
                <img 
                  src="/lovable-uploads/402b1e50-6b1e-40ae-abbb-0c98816bea46.png" 
                  alt="Loading" 
                  className="h-12 w-12 mx-auto mb-4 animate-spin"
                />
              </div>
              <p className="text-slate-300 text-lg">Loading props data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-40 right-10 w-80 h-80 bg-blue-600 opacity-15 rounded-full blur-2xl animate-ping" />
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-slate-600 opacity-10 rounded-full blur-2xl animate-pulse transform -translate-x-1/2" />
      
      <div className="relative z-10 container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="border-b border-slate-700 pb-6 glass-card p-6">
          <div className="flex items-center gap-4">
            <GitCompare className="h-12 w-12 text-blue-400" />
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Compare Props
              </h1>
              <p className="text-xl text-slate-400 mt-2">
                Side-by-side analysis of up to 4 props with detailed metrics
              </p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <Card className="glass-card border border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Select Props
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by player name, team, or stat type (e.g., 'LeBron James points', 'Lakers', 'assists')"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(e.target.value.trim().length > 0);
                }}
                onFocus={() => setShowDropdown(searchQuery.trim().length > 0)}
                className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 h-12"
              />
              
              {/* Search Results Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 glass-card border border-slate-600 rounded-lg max-h-80 overflow-y-auto z-50">
                  {searchResults.map((prop) => (
                    <div
                      key={prop.prop_id}
                      className="p-3 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-white font-medium">{prop.player_name}</span>
                            <span className="text-slate-400">|</span>
                            <span className="text-slate-300">{prop.team} vs {prop.against_team}</span>
                            <span className="text-slate-400">|</span>
                            <span className="text-blue-400">{prop.stat_type}</span>
                            <span className="text-slate-400">|</span>
                            <span className="text-white font-bold">{prop.line_score}</span>
                            <Badge 
                              variant={prop.odds_type === 'goblin' ? 'destructive' : prop.odds_type === 'demon' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {prop.odds_type}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddProp(prop)}
                          disabled={selectedProps.length >= 4 || selectedProps.some(p => p.prop_id === prop.prop_id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Add to Compare
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* No Results */}
              {showDropdown && searchResults.length === 0 && debouncedSearchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 glass-card border border-slate-600 rounded-lg p-4 z-50">
                  <p className="text-slate-400 text-center">No results found</p>
                </div>
              )}
            </div>

            {/* Selected Props Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, index) => {
                const prop = selectedProps[index];
                return (
                  <div
                    key={index}
                    className={`glass-card border border-slate-600 rounded-lg p-4 h-32 flex items-center justify-center ${
                      prop ? 'bg-slate-800/30' : 'bg-slate-800/10 border-dashed'
                    }`}
                  >
                    {prop ? (
                      <div className="text-center w-full">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-white truncate">{prop.player_name}</div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveProp(prop.prop_id)}
                            className="h-6 w-6 p-0 hover:bg-red-600/20"
                          >
                            <X className="h-3 w-3 text-red-400" />
                          </Button>
                        </div>
                        <div className="text-xs text-slate-400">{prop.team} vs {prop.against_team}</div>
                        <div className="text-sm text-blue-400 mt-1">{prop.stat_type}</div>
                        <div className="text-lg font-bold text-white">{prop.line_score}</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-slate-500 text-sm">Slot {index + 1}</div>
                        <div className="text-slate-600 text-xs mt-1">Select a prop to compare</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            {selectedProps.length > 1 && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleExport} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={handleShare} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparison Table */}
        {selectedProps.length > 1 && (
          <ComparisonTable props={selectedProps} />
        )}
      </div>
    </div>
  );
};
