
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Bell, Plus, X, AlertTriangle } from 'lucide-react';

interface Alert {
  id: string;
  name: string;
  type: 'score_threshold' | 'odds_change' | 'line_change' | 'new_prop';
  enabled: boolean;
  conditions: {
    min_score?: number;
    max_score?: number;
    player_names?: string[];
    stat_types?: string[];
    odds_types?: string[];
  };
}

export const AlertsManager: React.FC = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      name: 'High Confidence Props',
      type: 'score_threshold',
      enabled: true,
      conditions: {
        min_score: 0.875,
      },
    },
  ]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newAlert, setNewAlert] = useState<Partial<Alert>>({
    name: '',
    type: 'score_threshold',
    enabled: true,
    conditions: {},
  });

  const alertTypes = [
    { value: 'score_threshold', label: 'Score Threshold' },
    { value: 'odds_change', label: 'Odds Category Change' },
    { value: 'line_change', label: 'Line Change' },
    { value: 'new_prop', label: 'New Prop Added' },
  ];

  const createAlert = () => {
    if (!newAlert.name?.trim()) {
      toast({
        title: 'Invalid Alert',
        description: 'Please enter a name for your alert.',
        variant: 'destructive',
      });
      return;
    }

    const alert: Alert = {
      id: Date.now().toString(),
      name: newAlert.name.trim(),
      type: newAlert.type as Alert['type'],
      enabled: true,
      conditions: newAlert.conditions || {},
    };

    setAlerts(prev => [...prev, alert]);
    setNewAlert({
      name: '',
      type: 'score_threshold',
      enabled: true,
      conditions: {},
    });
    setIsCreating(false);

    toast({
      title: 'Alert Created',
      description: `Alert "${alert.name}" has been created.`,
    });
  };

  const toggleAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, enabled: !alert.enabled }
        : alert
    ));
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    
    toast({
      title: 'Alert Deleted',
      description: 'Alert has been deleted.',
    });
  };

  const getAlertDescription = (alert: Alert): string => {
    switch (alert.type) {
      case 'score_threshold':
        if (alert.conditions.min_score) {
          return `Score ≥ ${alert.conditions.min_score}`;
        }
        return 'Score threshold';
      case 'odds_change':
        return 'When odds category changes';
      case 'line_change':
        return 'When line changes';
      case 'new_prop':
        return 'When new props are added';
      default:
        return 'Custom alert';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Custom Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create New Alert */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Create Alert</h4>
            {!isCreating && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsCreating(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Alert
              </Button>
            )}
          </div>

          {isCreating && (
            <div className="border rounded-lg p-4 space-y-3">
              <Input
                placeholder="Alert name..."
                value={newAlert.name || ''}
                onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
              />
              
              <Select
                value={newAlert.type}
                onValueChange={(value) => setNewAlert(prev => ({ 
                  ...prev, 
                  type: value as Alert['type'],
                  conditions: {} 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {alertTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {newAlert.type === 'score_threshold' && (
                <Input
                  type="number"
                  placeholder="Minimum score (e.g., 0.875)"
                  step="0.001"
                  value={newAlert.conditions?.min_score || ''}
                  onChange={(e) => setNewAlert(prev => ({
                    ...prev,
                    conditions: {
                      ...prev.conditions,
                      min_score: parseFloat(e.target.value) || undefined
                    }
                  }))}
                />
              )}

              <div className="flex gap-2">
                <Button size="sm" onClick={createAlert}>
                  Create Alert
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setNewAlert({
                      name: '',
                      type: 'score_threshold',
                      enabled: true,
                      conditions: {},
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Active Alerts */}
        <div>
          <h4 className="text-sm font-medium mb-2">Active Alerts</h4>
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No alerts configured</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={alert.enabled}
                        onCheckedChange={() => toggleAlert(alert.id)}
                      />
                      <div>
                        <h5 className="font-medium">{alert.name}</h5>
                        <p className="text-xs text-muted-foreground">
                          {getAlertDescription(alert)}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteAlert(alert.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
