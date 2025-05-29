
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useChangeNotifications } from '@/hooks/useChangeNotifications';
import { Clock, TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';

export const ChangeHistoryTable: React.FC = () => {
  const { notifications, isLoading } = useChangeNotifications();

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'new': return <Plus className="h-4 w-4 text-green-600" />;
      case 'removed': return <Minus className="h-4 w-4 text-red-600" />;
      case 'changed': return <TrendingUp className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getChangeBadge = (type: string) => {
    switch (type) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'removed': return 'bg-red-100 text-red-800';
      case 'changed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Change History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading change history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Change History
          <Badge variant="secondary">{notifications.length} changes</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No changes recorded yet
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>Matchup</TableHead>
                  <TableHead>Stat</TableHead>
                  <TableHead>Line</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => {
                  const prop = notification.prop;
                  if (!prop) return null;

                  return (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChangeIcon(notification.type)}
                          <Badge className={getChangeBadge(notification.type)}>
                            {notification.type.toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{prop.player_name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {prop.team} vs {prop.against_team}
                        </div>
                      </TableCell>
                      <TableCell>{prop.stat_type}</TableCell>
                      <TableCell className="font-mono">{prop.line_score}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{prop.odds_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {notification.changes && Object.keys(notification.changes).length > 0 ? (
                          <div className="text-xs space-y-1">
                            {Object.entries(notification.changes).map(([field, change]) => (
                              <div key={field}>
                                <span className="font-medium">{field}:</span>{' '}
                                <span className="text-red-600">{change.previous}</span> →{' '}
                                <span className="text-green-600">{change.current}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatTimestamp(notification.timestamp)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
