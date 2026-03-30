
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/use-toast';
import { Filter, X, Save, Settings } from 'lucide-react';
import { PropFilters } from '@/types/nba';

interface FilterPresetsManagerProps {
  currentFilters: PropFilters;
  onApplyPreset: (filters: PropFilters) => void;
}

interface FilterPreset {
  id: string;
  name: string;
  filters: PropFilters;
}

export const FilterPresetsManager: React.FC<FilterPresetsManagerProps> = ({
  currentFilters,
  onApplyPreset,
}) => {
  const { preferences, updatePreferences } = useUserPreferences();
  const { toast } = useToast();
  const [presetName, setPresetName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // For now, we'll store presets in local state since the user_preferences table
  // doesn't have a filter_presets column yet. In a real implementation, 
  // this would be stored in the database.
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([
    {
      id: '1',
      name: 'High Confidence',
      filters: {
        odds_types: ['goblin'],
        min_score: 0.875,
        min_sample_size: 5,
      },
    },
    {
      id: '2',
      name: 'Guards Only',
      filters: {
        positions: ['PG', 'SG'],
        min_score: 0.75,
      },
    },
  ]);

  const saveCurrentFilters = async () => {
    if (!presetName.trim()) {
      toast({
        title: 'Invalid Name',
        description: 'Please enter a name for your filter preset.',
        variant: 'destructive',
      });
      return;
    }

    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      filters: currentFilters,
    };

    setFilterPresets(prev => [...prev, newPreset]);
    setPresetName('');
    setIsCreating(false);

    toast({
      title: 'Preset Saved',
      description: `Filter preset "${newPreset.name}" has been saved.`,
    });
  };

  const deletePreset = (presetId: string) => {
    setFilterPresets(prev => prev.filter(preset => preset.id !== presetId));
    
    toast({
      title: 'Preset Deleted',
      description: 'Filter preset has been deleted.',
    });
  };

  const getFilterDescription = (filters: PropFilters): string => {
    const parts: string[] = [];
    
    if (filters.teams?.length) {
      parts.push(`${filters.teams.join(', ')} teams`);
    }
    if (filters.odds_types?.length) {
      parts.push(`${filters.odds_types.join(', ')} odds`);
    }
    if (filters.positions?.length) {
      parts.push(`${filters.positions.join(', ')} positions`);
    }
    if (filters.stat_types?.length) {
      parts.push(`${filters.stat_types.join(', ')} stats`);
    }
    if (filters.sample_sizes?.length) {
      parts.push(`sample sizes ${filters.sample_sizes.join(', ')}`);
    }
    if (filters.min_score) {
      parts.push(`min score ${filters.min_score}`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'No filters';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Presets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Save Current Filters */}
        <div>
          <h4 className="text-sm font-medium mb-2">Save Current Filters</h4>
          {!isCreating ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsCreating(true)}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Current Filters as Preset
            </Button>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Preset name..."
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveCurrentFilters()}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveCurrentFilters}>
                  Save
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setPresetName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Saved Presets */}
        <div>
          <h4 className="text-sm font-medium mb-2">Saved Presets</h4>
          {filterPresets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved presets</p>
          ) : (
            <div className="space-y-2">
              {filterPresets.map((preset) => (
                <div key={preset.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">{preset.name}</h5>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onApplyPreset(preset.filters)}
                      >
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deletePreset(preset.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getFilterDescription(preset.filters)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
