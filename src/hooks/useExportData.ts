
import { useMutation } from '@tanstack/react-query';
import { Prop, PropFilters } from '@/types/nba';
import { useToast } from './use-toast';

interface ExportOptions {
  format: 'csv' | 'json';
  includeFilters: boolean;
  sortBy?: keyof Prop;
  sortDirection?: 'asc' | 'desc';
}

export const useExportData = () => {
  const { toast } = useToast();

  const exportData = useMutation({
    mutationFn: async ({ 
      props, 
      filters, 
      options 
    }: { 
      props: Prop[]; 
      filters: PropFilters; 
      options: ExportOptions 
    }) => {
      // Sort data if specified
      let sortedProps = [...props];
      if (options.sortBy && options.sortDirection) {
        sortedProps.sort((a, b) => {
          const aVal = a[options.sortBy!];
          const bVal = b[options.sortBy!];
          
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return options.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
          }
          
          const aStr = String(aVal);
          const bStr = String(bVal);
          return options.sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
        });
      }

      if (options.format === 'csv') {
        return exportToCSV(sortedProps, filters, options.includeFilters);
      } else {
        return exportToJSON(sortedProps, filters, options.includeFilters);
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Export Successful',
        description: `Data exported successfully as ${data.format.toUpperCase()}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Export Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    exportData,
    isExporting: exportData.isPending,
  };
};

// Export to CSV matching Python output format
function exportToCSV(props: Prop[], filters: PropFilters, includeFilters: boolean) {
  // CSV headers matching your Python output format
  const headers = [
    'Name', 'Position', 'Team', 'AgainstTeam', 'Stat', 'Line', 'Odds', 
    'H2HArray', 'L5Array', 'H2HAvg', 'L5Avg', 'H2HDiff', 'H2HRelDiff', 
    'H2HPercent', 'L5Diff', 'L5RelDiff', 'L5Percent', 'Sample Size', 
    'H2H Score', 'L5 Score', 'Final Score', 'GameId'
  ];

  const csvRows = [headers.join(',')];

  // Add filter info if requested
  if (includeFilters && Object.keys(filters).length > 0) {
    csvRows.push('# Applied Filters:');
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        csvRows.push(`# ${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
      }
    });
    csvRows.push(''); // Empty line after filters
  }

  // Add data rows
  props.forEach(prop => {
    // Calculate additional metrics
    const h2hDiff = prop.h2h_avg - prop.line_score;
    const h2hRelDiff = (prop.h2h_avg - prop.line_score) / (prop.line_score + 5);
    const h2hPercent = 100 * (prop.h2h_avg - prop.line_score) / prop.line_score;
    
    const l5Diff = prop.l5_avg - prop.line_score;
    const l5RelDiff = (prop.l5_avg - prop.line_score) / (prop.line_score + 5);
    const l5Percent = 100 * (prop.l5_avg - prop.line_score) / prop.line_score;

    const row = [
      escapeCSV(prop.player_name),
      escapeCSV(prop.position),
      escapeCSV(prop.team),
      escapeCSV(prop.against_team),
      escapeCSV(prop.stat_type),
      prop.line_score,
      escapeCSV(prop.odds_type),
      escapeCSV(`[${prop.h2h_array.join(', ')}]`),
      escapeCSV(`[${prop.l5_array.join(', ')}]`),
      prop.h2h_avg.toFixed(3),
      prop.l5_avg.toFixed(3),
      h2hDiff.toFixed(3),
      h2hRelDiff.toFixed(3),
      h2hPercent.toFixed(3),
      l5Diff.toFixed(3),
      l5RelDiff.toFixed(3),
      l5Percent.toFixed(3),
      prop.sample_size,
      prop.h2h_score.toFixed(3),
      prop.l5_score.toFixed(3),
      prop.sorting_score.toFixed(3),
      escapeCSV(prop.game_id)
    ];

    csvRows.push(row.join(','));
  });

  const csvContent = csvRows.join('\n');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `nba_props_export_${timestamp}.csv`;
  
  downloadFile(csvContent, filename, 'text/csv');
  
  return { format: 'csv' as const, filename, rowCount: props.length };
}

// Export to JSON
function exportToJSON(props: Prop[], filters: PropFilters, includeFilters: boolean) {
  const exportData = {
    timestamp: new Date().toISOString(),
    totalProps: props.length,
    ...(includeFilters && { appliedFilters: filters }),
    props: props.map(prop => ({
      ...prop,
      // Add calculated metrics for consistency
      h2h_diff: prop.h2h_avg - prop.line_score,
      h2h_relative_diff: (prop.h2h_avg - prop.line_score) / (prop.line_score + 5),
      h2h_percent: 100 * (prop.h2h_avg - prop.line_score) / prop.line_score,
      l5_diff: prop.l5_avg - prop.line_score,
      l5_relative_diff: (prop.l5_avg - prop.line_score) / (prop.line_score + 5),
      l5_percent: 100 * (prop.l5_avg - prop.line_score) / prop.line_score,
    }))
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `nba_props_export_${timestamp}.json`;
  
  downloadFile(jsonContent, filename, 'application/json');
  
  return { format: 'json' as const, filename, rowCount: props.length };
}

// Helper functions
function escapeCSV(value: string | number): string {
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
