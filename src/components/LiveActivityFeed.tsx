
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';

interface Activity {
  id: string;
  type: 'new' | 'removed' | 'changed';
  player: string;
  team: string;
  statType: string;
  change?: string;
  timestamp: string;
}

interface LiveActivityFeedProps {
  activities: Activity[];
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new': return <Plus className="h-4 w-4 text-green-500" />;
      case 'removed': return <Minus className="h-4 w-4 text-red-500" />;
      case 'changed': return <TrendingUp className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'new': return 'border-l-green-500';
      case 'removed': return 'border-l-red-500';
      case 'changed': return 'border-l-orange-500';
      default: return 'border-l-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Card className="h-[600px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Live Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[520px]">
          <div className="space-y-3">
            {activities.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              activities.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className={`p-3 rounded-lg border-l-4 bg-card/50 ${getActivityColor(activity.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={`/placeholder-avatar.png`} />
                          <AvatarFallback className="text-xs">
                            {activity.player.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm truncate">
                          {activity.player}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {activity.team}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.type === 'new' && `New ${activity.statType} prop added`}
                        {activity.type === 'removed' && `${activity.statType} prop removed`}
                        {activity.type === 'changed' && `${activity.statType} ${activity.change}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
