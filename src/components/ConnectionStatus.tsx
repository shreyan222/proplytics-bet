
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRealtime } from '@/hooks/useRealtime';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const ConnectionStatus: React.FC = () => {
  const { isConnected, connect, disconnect } = useRealtime();

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={isConnected ? "default" : "destructive"}
        className="flex items-center gap-1"
      >
        {isConnected ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        {isConnected ? 'Live' : 'Offline'}
      </Badge>
      
      {!isConnected && (
        <Button
          variant="outline"
          size="sm"
          onClick={connect}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Reconnect
        </Button>
      )}
    </div>
  );
};
