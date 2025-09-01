import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { Prop } from '@/types/nba';
import { useQueryClient } from '@tanstack/react-query';

export type PropChangeType = 'new' | 'changed' | 'removed';

export interface PropChange {
  type: PropChangeType;
  timestamp: string;
  prop: Prop;
  changes?: {
    line_score?: { previous: number; current: number };
    odds_type?: { previous: string; current: string };
    stat_type?: { previous: string; current: string };
  };
}

export const usePropsRealtime = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [propChanges, setPropChanges] = useState<PropChange[]>([]);
  const [newProps, setNewProps] = useState<Prop[]>([]);
  const [changedProps, setChangedProps] = useState<PropChange[]>([]);
  const [removedProps, setRemovedProps] = useState<Prop[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Converts database prop to our app's Prop type
  const mapDbPropToProp = useCallback((payload: any): Prop => {
    const prop = payload.new || payload.old;
    
    // Safely extract team abbreviations (will need to fetch this from related data)
    const playerTeam = 'TBD'; // Will need to be fetched
    const againstTeam = 'TBD'; // Will need to be fetched

    return {
      prop_id: prop.id,
      player_id: prop.player_id,
      player_name: 'Unknown', // Will need to be fetched from player table
      position: 'Unknown', // Will need to be fetched from player table
      team: playerTeam,
      against_team: againstTeam,
      stat_type: prop.stat_type,
      line_score: Number(prop.line_score),
      odds_type: prop.odds_type as 'standard' | 'demon' | 'goblin',
      game_id: prop.game_id,
      start_time: prop.start_time || '',
      h2h_array: Array.isArray(prop.h2h_array) ? prop.h2h_array.map(Number) : [],
      l5_array: Array.isArray(prop.l5_array) ? prop.l5_array.map(Number) : [],
      h2h_avg: Number(prop.h2h_avg),
      l5_avg: Number(prop.l5_avg),
      h2h_score: Number(prop.h2h_score),
      l5_score: Number(prop.l5_score),
      sample_size: prop.sample_size,
      sorting_score: Number(prop.sorting_score),
    };
  }, []);

  // Track prop changes
  const trackPropChange = useCallback((change: PropChange) => {
    setPropChanges(prev => [change, ...prev].slice(0, 100)); // Keep last 100 changes
    setLastUpdateTime(new Date());

    // Update the filtered lists
    if (change.type === 'new') {
      setNewProps(prev => [change.prop, ...prev].slice(0, 50));
    } else if (change.type === 'changed') {
      setChangedProps(prev => [change, ...prev].slice(0, 50));
    } else if (change.type === 'removed') {
      setRemovedProps(prev => [change.prop, ...prev].slice(0, 50));
    }

    // Also show a toast notification
    let title = '';
    let description = '';

    switch (change.type) {
      case 'new':
        title = 'New Prop Available';
        description = `${change.prop.player_name} - ${change.prop.stat_type} ${change.prop.line_score}`;
        break;
      case 'removed':
        title = 'Prop Removed';
        description = `${change.prop.player_name} - ${change.prop.stat_type} ${change.prop.line_score}`;
        break;
      case 'changed':
        title = 'Prop Updated';
        description = `${change.prop.player_name} - ${change.prop.stat_type}`;
        if (change.changes?.line_score) {
          description += ` Line: ${change.changes.line_score.previous} → ${change.changes.line_score.current}`;
        }
        break;
    }

    toast({
      title,
      description,
      duration: 5000,
    });

    // Refresh the main props data
    queryClient.invalidateQueries({ queryKey: ['props'] });
  }, [toast, queryClient]);

  useEffect(() => {
    // Set up subscription to props table changes
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'props' },
        (payload) => {
          const prop = mapDbPropToProp(payload);
          
          trackPropChange({
            type: 'new',
            timestamp: new Date().toISOString(),
            prop
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'props' },
        (payload) => {
          const prop = mapDbPropToProp(payload);
          
          // Determine what changed
          const changes: PropChange['changes'] = {};
          
          if (payload.old.line_score !== payload.new.line_score) {
            changes.line_score = {
              previous: Number(payload.old.line_score),
              current: Number(payload.new.line_score)
            };
          }
          
          if (payload.old.odds_type !== payload.new.odds_type) {
            changes.odds_type = {
              previous: payload.old.odds_type,
              current: payload.new.odds_type
            };
          }
          
          if (payload.old.stat_type !== payload.new.stat_type) {
            changes.stat_type = {
              previous: payload.old.stat_type,
              current: payload.new.stat_type
            };
          }

          trackPropChange({
            type: 'changed',
            timestamp: new Date().toISOString(),
            prop,
            changes
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'props' },
        (payload) => {
          const prop = mapDbPropToProp(payload);
          
          trackPropChange({
            type: 'removed',
            timestamp: new Date().toISOString(),
            prop
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          toast({
            title: 'Real-time Connected',
            description: 'Live prop updates are now active',
          });
        }
      });

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [mapDbPropToProp, trackPropChange, toast]);

  // Function to clear changes list
  const clearChanges = useCallback((type?: PropChangeType) => {
    if (!type) {
      setPropChanges([]);
      setNewProps([]);
      setChangedProps([]);
      setRemovedProps([]);
    } else if (type === 'new') {
      setNewProps([]);
    } else if (type === 'changed') {
      setChangedProps([]);
    } else if (type === 'removed') {
      setRemovedProps([]);
    }
  }, []);

  return {
    isConnected,
    propChanges,
    newProps,
    changedProps, 
    removedProps,
    lastUpdateTime,
    clearChanges
  };
};