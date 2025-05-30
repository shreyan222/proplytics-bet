
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useExportData } from '@/hooks/useExportData';
import { Prop, PropFilters } from '@/types/nba';
import { Download, FileText, Database } from 'lucide-react';

interface ExportManagerProps {
  props: Prop[];
  filters: PropFilters;
}

export const ExportManager: React.FC<ExportManagerProps> = ({ props, filters }) => {
  const { exportData, isExporting } = useExportData();
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [includeFilters, setIncludeFilters] = useState(true);
  const [sortBy, setSortBy] = useState<string>('sorting_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleExport = () => {
    exportData.mutate({
      props,
      filters,
      options: {
        format,
        includeFilters,
        sortBy: sortBy as keyof Prop,
        sortDirection,
      },
    });
  };

  const sortOptions = [
    { value: 'sorting_score', label: 'Final Score' },
    { value: 'h2h_score', label: 'H2H Score' },
    { value: 'l5_score', label: 'L5 Score' },
    { value: 'player_name', label: 'Player Name' },
    { value: 'team', label: 'Team' },
    { value: 'stat_type', label: 'Stat Type' },
    { value: 'line_score', label: 'Line Score' },
    { value: 'sample_size', label: 'Sample Size' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Export Format</label>
            <Select value={format} onValueChange={(value: 'csv' | 'json') => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV (Excel compatible)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    JSON (Machine readable)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Sort Direction</label>
            <Select value={sortDirection} onValueChange={(value: 'asc' | 'desc') => setSortDirection(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending (High to Low)</SelectItem>
                <SelectItem value="asc">Ascending (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="include-filters"
              checked={includeFilters}
              onCheckedChange={(checked) => setIncludeFilters(checked as boolean)}
            />
            <label
              htmlFor="include-filters"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Include applied filters in export
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Exporting {props.length} props with {Object.keys(filters).length} filter(s) applied
          </div>
          <Button 
            onClick={handleExport}
            disabled={isExporting || props.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : `Export ${format.toUpperCase()}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
