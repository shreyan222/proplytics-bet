import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bell, BellOff, X, Trash2, Settings } from 'lucide-react';
import { useChangeNotifications } from '@/hooks/useChangeNotifications';
import { ChangeNotification } from '@/types/nba';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onToggle }) => {
  const { notifications, isLoading, markAsRead, clearAll, unreadCount } = useChangeNotifications();

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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = (notification: ChangeNotification) => {
    const prop = notification.prop;
    if (!prop) return null;

    return (
      <div key={notification.id} className="p-3 border-b hover:bg-muted/50 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getNotificationIcon(notification.type)}</span>
              <Badge className={cn('text-xs', getNotificationColor(notification.type))}>
                {notification.type.toUpperCase()}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(notification.timestamp)}
              </span>
            </div>
            
            <div className="text-sm font-medium text-foreground">
              {prop.player_name} - {prop.stat_type}
            </div>
            
            <div className="text-xs text-muted-foreground/80 mt-1">
              {prop.team} vs {prop.against_team} • Line: {prop.line_score} • {prop.odds_type}
            </div>

            {notification.type === 'changed' && notification.changes && (
              <div className="mt-2 text-xs">
                {Object.entries(notification.changes).map(([field, change]) => (
                  <div key={field} className="text-muted-foreground/80">
                    {field}: {change.previous} → {change.current}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAsRead.mutate(notification.id)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className="absolute top-12 right-0 w-96 max-h-[500px] z-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount}</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearAll.mutate()}
              disabled={notifications.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <BellOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No notifications
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            {notifications.map(renderNotification)}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
