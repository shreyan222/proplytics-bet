
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceAnalytics } from '@/components/PerformanceAnalytics';
import { ExportManager } from '@/components/ExportManager';
import { PropFilters } from '@/types/nba';
import { PropsFilters } from '@/components/PropsFilters';
import { BarChart3, Download, TrendingUp } from 'lucide-react';
import { LeagueSelector } from '@/components/LeagueSelector';
import { getPropsForLeague } from '@/utils/multiLeagueSampleData';

export const AnalyticsPage: React.FC = () => {
  const [selectedLeague, setSelectedLeague] = useState<'NBA' | 'NFL' | 'MLB'>('NBA');
  const props = getPropsForLeague(selectedLeague);
  
  const [filters, setFilters] = useState<PropFilters>({});

  // Simple filtering logic for now
  const filteredProps = props.filter(prop => {
    if (filters.teams && filters.teams.length > 0 && !filters.teams.includes(prop.team)) return false;
    if (filters.positions && filters.positions.length > 0 && !filters.positions.includes(prop.position)) return false;
    if (filters.stat_types && filters.stat_types.length > 0 && !filters.stat_types.includes(prop.stat_type)) return false;
    if (filters.odds_types && filters.odds_types.length > 0 && !filters.odds_types.includes(prop.odds_type)) return false;
    if (filters.min_score && prop.sorting_score < filters.min_score) return false;
    if (filters.max_score && prop.sorting_score > filters.max_score) return false;
    return true;
  });

  const updateFilters = (newFilters: PropFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* League Selector */}
      <LeagueSelector
        selectedLeague={selectedLeague}
        onLeagueChange={setSelectedLeague}
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">{selectedLeague} Analytics & Export</h1>
        <p className="text-base text-slate-400">
          Performance insights and data export tools for {selectedLeague} props
        </p>
      </div>

      {/* Filters */}
      <PropsFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
        totalProps={props.length}
        filteredProps={filteredProps.length}
      />

      {/* Main Content */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700">
          <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-blue-600">
            <BarChart3 className="h-4 w-4" />
            Performance Analytics
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2 data-[state=active]:bg-green-600">
            <Download className="h-4 w-4" />
            Data Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <PerformanceAnalytics props={filteredProps} />
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <ExportManager props={filteredProps} filters={filters} />
          
          {/* Export Preview */}
          <Card className="glass-card border border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5" />
                {selectedLeague} Export Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border border-slate-700 rounded bg-slate-800/50">
                    <div className="text-2xl font-bold text-blue-400">
                      {filteredProps.filter(p => p.odds_type === 'standard').length}
                    </div>
                    <div className="text-sm text-slate-400">Standard Props</div>
                  </div>
                  <div className="text-center p-4 border border-slate-700 rounded bg-slate-800/50">
                    <div className="text-2xl font-bold text-red-400">
                      {filteredProps.filter(p => p.odds_type === 'demon').length}
                    </div>
                    <div className="text-sm text-slate-400">Demon Props</div>
                  </div>
                  <div className="text-center p-4 border border-slate-700 rounded bg-slate-800/50">
                    <div className="text-2xl font-bold text-green-400">
                      {filteredProps.filter(p => p.odds_type === 'goblin').length}
                    </div>
                    <div className="text-sm text-slate-400">Goblin Props</div>
                  </div>
                </div>
                
                {filteredProps.length > 0 && (
                  <div className="text-sm text-slate-400">
                    Top scoring {selectedLeague} prop: <strong className="text-white">{filteredProps[0]?.player_name}</strong> - 
                    {filteredProps[0]?.stat_type} {filteredProps[0]?.line_score} 
                    (Score: {filteredProps[0]?.sorting_score.toFixed(3)})
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
