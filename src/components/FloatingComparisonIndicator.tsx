import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GitCompare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useComparison } from '@/contexts/ComparisonContext';
import { cn } from '@/lib/utils';

export const FloatingComparisonIndicator: React.FC = () => {
  const navigate = useNavigate();
  const { selectedProps, clearProps } = useComparison();

  // Don't show if no props are selected
  if (selectedProps.length === 0) {
    return null;
  }

  const handleGoToCompare = () => {
    navigate('/compare');
  };

  const handleClearAll = () => {
    clearProps();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-600 rounded-xl shadow-2xl p-4 min-w-[280px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-blue-400" />
            <span className="text-white font-semibold">Props Comparison</span>
            <Badge variant="secondary" className="ml-2">
              {selectedProps.length}/4
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-6 w-6 p-0 hover:bg-red-600/20 hover:text-red-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2 mb-3">
          {selectedProps.slice(0, 3).map((prop) => (
            <div key={prop.prop_id} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
              <span className="text-slate-300 truncate">{prop.player_name}</span>
              <span className="text-slate-500 text-xs">({prop.stat_type})</span>
            </div>
          ))}
          {selectedProps.length > 3 && (
            <div className="text-slate-400 text-xs">
              +{selectedProps.length - 3} more props...
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleGoToCompare}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <GitCompare className="h-4 w-4 mr-2" />
            View Comparison
          </Button>
        </div>
      </div>
    </div>
  );
};
