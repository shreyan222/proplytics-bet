
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceAnalytics } from '@/components/PerformanceAnalytics';
import { ExportManager } from '@/components/ExportManager';
import { usePropsData } from '@/hooks/usePropsData';
import { useFilteredProps } from '@/hooks/useFilteredProps';
import { useState } from 'react';
import { PropFilters } from '@/types/nba';
import { PropsFilters } from '@/components/PropsFilters';
import { BarChart3, Download, TrendingUp } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { data: props = [], isLoading, error } = usePropsData();
  const [filters, setFilters] = useState<PropFilters>({});
  const filteredProps = useFilteredProps(props, filters);

  const updateFilters = (newFilters: PropFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-500">Error loading data: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics & Export</h1>
        <p className="text-muted-foreground">
          Performance insights and data export tools
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance Analytics
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Export Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {filteredProps.filter(p => p.odds_type === 'standard').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Standard Props</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-orange-600">
                      {filteredProps.filter(p => p.odds_type === 'demon').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Demon Props</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-red-600">
                      {filteredProps.filter(p => p.odds_type === 'goblin').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Goblin Props</div>
                  </div>
                </div>
                
                {filteredProps.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Top scoring prop: <strong>{filteredProps[0]?.player_name}</strong> - 
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
