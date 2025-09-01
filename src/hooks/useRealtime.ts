
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

interface PropCounts {
  standard: number;
  demon: number;
  goblin: number;
  total: number;
}

interface ActiveGames {
  games: Array<{
    id: string;
    start_time: string;
    home_team: { abbreviation: string };
    away_team: { abbreviation: string };
  }>;
  count: number;
}

interface RealtimeMessage {
  type: string;
  data?: any;
  timestamp: string;
  connectionId?: string;
}

export const useRealtime = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [propCounts, setPropCounts] = useState<PropCounts>({
    standard: 0,
    demon: 0,
    goblin: 0,
    total: 0
  });
  const [activeGames, setActiveGames] = useState<ActiveGames>({
    games: [],
    count: 0
  });
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Use the Supabase project URL for WebSocket connection
    const wsUrl = `wss://tlpzzneewikrpqfqygxi.supabase.co/functions/v1/realtime-updates`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setConnectionAttempts(0);

        // Authenticate if user is logged in
        if (user) {
          wsRef.current?.send(JSON.stringify({
            type: 'authenticate',
            userId: user.id
          }));
        }

        // Subscribe to real-time changes
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe_to_changes'
        }));

        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000); // Ping every 30 seconds
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'connection_established':
              toast({
                title: 'Real-time Connected',
                description: 'Live updates are now active',
              });
              break;

            case 'prop_counts_update':
              setPropCounts(message.data);
              setLastUpdate(new Date());
              break;

            case 'active_games_update':
              setActiveGames(message.data);
              break;

            case 'prop_change_notification':
              handlePropChangeNotification(message.data);
              break;

            case 'pong':
              break;

            default:
              // Unknown message type
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Attempt to reconnect with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000);
        setConnectionAttempts(prev => prev + 1);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setIsConnected(false);
    }
  }, [user, toast, connectionAttempts]);

  const handlePropChangeNotification = (data: any) => {
    const { type, prop, changes } = data;
    
    let title = '';
    let description = '';

    switch (type) {
      case 'new':
        title = 'New Prop Available';
        description = `${prop.player_name} - ${prop.stat_type} ${prop.line_score} (${prop.odds_type})`;
        break;
      case 'removed':
        title = 'Prop Removed';
        description = `${prop.player_name} - ${prop.stat_type} ${prop.line_score}`;
        break;
      case 'changed':
        title = 'Prop Updated';
        description = `${prop.player_name} - ${prop.stat_type}`;
        if (changes.line_score) {
          description += ` Line: ${changes.line_score.previous} → ${changes.line_score.current}`;
        }
        break;
    }

    toast({
      title,
      description,
      duration: 5000,
    });

    // Refresh data
    queryClient.invalidateQueries({ queryKey: ['props'] });
    queryClient.invalidateQueries({ queryKey: ['change-notifications'] });
  };

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const refreshData = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe_to_changes'
      }));
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    propCounts,
    activeGames,
    lastUpdate,
    connect,
    disconnect,
    refreshData,
  };
};
