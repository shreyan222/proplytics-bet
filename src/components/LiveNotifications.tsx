import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealtime } from '@/hooks/useRealtime';
import { Bell, BellOff, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'new' | 'removed' | 'changed';
  title: string;
  description: string;
  timestamp: Date;
}

export const LiveNotifications: React.FC = () => {
  const { isConnected } = useRealtime();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    if (!isEnabled) return;

    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50

    // Play notification sound if enabled
    if (soundEnabled) {
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore autoplay restrictions
        });
      } catch (error) {
        console.log('Could not play notification sound:', error);
      }
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new': return '🆕';
      case 'removed': return '🗑️';
      case 'changed': return '📝';
      default: return '📊';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'removed': return 'bg-red-100 text-red-800';
      case 'changed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Simulate receiving notifications for demo purposes
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      // This would normally come from WebSocket messages
      const mockNotifications = [
        {
          type: 'new' as const,
          title: 'New Prop Available',
          description: 'LeBron James - Points 25.5 (demon)',
        },
        {
          type: 'changed' as const,
          title: 'Prop Updated',
          description: 'Stephen Curry - 3-PT Made: Line changed 3.5 → 4.5',
        },
        {
          type: 'removed' as const,
          title: 'Prop Removed',
          description: 'Anthony Davis - Rebounds 12.5',
        },
      ];

      if (Math.random() > 0.8) { // 20% chance every interval
        const notification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
        addNotification(notification);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isConnected, isEnabled, soundEnabled]);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <Bell className="h-5 w-5 text-green-500" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-400" />
            )}
            Live Notifications
            {notifications.length > 0 && (
              <Badge variant="secondary">{notifications.length}</Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEnabled(!isEnabled)}
            >
              {isEnabled ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              disabled={notifications.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {!isConnected ? (
          <div className="p-4 text-center text-muted-foreground">
            <BellOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Notifications unavailable - Not connected to real-time service
          </div>
        ) : !isEnabled ? (
          <div className="p-4 text-center text-muted-foreground">
            <BellOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Notifications disabled
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No notifications yet
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getNotificationColor(notification.type)}>
                          {notification.type.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="text-sm font-medium text-foreground">{notification.title}</div>
                      <div className="text-xs text-muted-foreground/80 mt-1">
                        {notification.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
