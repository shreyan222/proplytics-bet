
import { useState, useEffect } from 'react';
import { usePropsData } from './usePropsData';
import { useUserPreferences } from './useUserPreferences';
import { useToast } from './use-toast';
import { Prop } from '@/types/nba';

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

export const useAlerts = () => {
  const { data: props = [] } = usePropsData();
  const { preferences } = useUserPreferences();
  const { toast } = useToast();
  const [previousProps, setPreviousProps] = useState<Prop[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Check alerts when props data changes
  useEffect(() => {
    if (props.length === 0 || previousProps.length === 0) {
      setPreviousProps(props);
      return;
    }

    // Check for new props
    const newProps = props.filter(prop => 
      !previousProps.some(prevProp => prevProp.prop_id === prop.prop_id)
    );

    // Check for prop changes
    const changedProps = props.filter(prop => {
      const prevProp = previousProps.find(p => p.prop_id === prop.prop_id);
      return prevProp && (
        prevProp.odds_type !== prop.odds_type ||
        prevProp.line_score !== prop.line_score ||
        Math.abs(prevProp.sorting_score - prop.sorting_score) > 0.01
      );
    });

    // Process alerts
    alerts.forEach(alert => {
      if (!alert.enabled) return;

      switch (alert.type) {
        case 'new_prop':
          newProps.forEach(prop => {
            if (matchesAlertConditions(prop, alert)) {
              showAlert(alert, `New prop: ${prop.player_name} ${prop.stat_type}`, prop);
            }
          });
          break;

        case 'score_threshold':
          props.forEach(prop => {
            if (alert.conditions.min_score && 
                prop.sorting_score >= alert.conditions.min_score &&
                matchesAlertConditions(prop, alert)) {
              const prevProp = previousProps.find(p => p.prop_id === prop.prop_id);
              if (!prevProp || prevProp.sorting_score < alert.conditions.min_score) {
                showAlert(alert, `High score prop: ${prop.player_name} ${prop.stat_type} (${prop.sorting_score.toFixed(3)})`, prop);
              }
            }
          });
          break;

        case 'odds_change':
          changedProps.forEach(prop => {
            const prevProp = previousProps.find(p => p.prop_id === prop.prop_id);
            if (prevProp && prevProp.odds_type !== prop.odds_type &&
                matchesAlertConditions(prop, alert)) {
              showAlert(alert, `Odds changed: ${prop.player_name} ${prop.stat_type} (${prevProp.odds_type} → ${prop.odds_type})`, prop);
            }
          });
          break;

        case 'line_change':
          changedProps.forEach(prop => {
            const prevProp = previousProps.find(p => p.prop_id === prop.prop_id);
            if (prevProp && prevProp.line_score !== prop.line_score &&
                matchesAlertConditions(prop, alert)) {
              showAlert(alert, `Line changed: ${prop.player_name} ${prop.stat_type} (${prevProp.line_score} → ${prop.line_score})`, prop);
            }
          });
          break;
      }
    });

    setPreviousProps(props);
  }, [props, alerts, previousProps, toast]);

  const matchesAlertConditions = (prop: Prop, alert: Alert): boolean => {
    // Check if prop matches alert conditions
    if (alert.conditions.player_names?.length && 
        !alert.conditions.player_names.includes(prop.player_name)) {
      return false;
    }

    if (alert.conditions.stat_types?.length && 
        !alert.conditions.stat_types.includes(prop.stat_type)) {
      return false;
    }

    if (alert.conditions.odds_types?.length && 
        !alert.conditions.odds_types.includes(prop.odds_type)) {
      return false;
    }

    // Check if this is for a favorite player only
    if (preferences?.notification_settings?.favorite_players_only) {
      const favoritePlayerIds = preferences?.favorite_players || [];
      if (!favoritePlayerIds.includes(prop.player_name)) {
        return false;
      }
    }

    return true;
  };

  const showAlert = (alert: Alert, message: string, prop: Prop) => {
    toast({
      title: alert.name,
      description: message,
      duration: 5000,
    });
  };

  return {
    alerts,
    setAlerts,
  };
};
