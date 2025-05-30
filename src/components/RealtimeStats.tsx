
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRealtime } from '@/hooks/useRealtime';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  Gamepad2,
  Trophy,
  Target,
  Award
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const RealtimeStats: React.FC = () => {
  const { 
    isConnected, 
    propCounts, 
    activeGames, 
    lastUpdate, 
    refreshData 
  } = useRealtime();

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Never';
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              Real-time Status
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={!isConnected}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              {lastUpdate && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Updated {formatLastUpdate(lastUpdate)}
                </div>
              )}
            </div>
            <Activity className={`h-5 w-5 ${isConnected ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
          </div>
        </CardContent>
      </Card>

      {/* Real-time Prop Counts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Props</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propCounts.total}</div>
            <p className="text-xs text-muted-foreground">
              All active propositions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Standard</CardTitle>
            <Trophy className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{propCounts.standard}</div>
            <p className="text-xs text-muted-foreground">
              Standard confidence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demon</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{propCounts.demon}</div>
            <p className="text-xs text-muted-foreground">
              High confidence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goblin</CardTitle>
            <Award className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{propCounts.goblin}</div>
            <p className="text-xs text-muted-foreground">
              Premium picks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Games */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Active Games
            <Badge variant="secondary">{activeGames.count}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeGames.count === 0 ? (
            <p className="text-muted-foreground">No active games</p>
          ) : (
            <div className="space-y-2">
              {activeGames.games.slice(0, 5).map((game) => (
                <div key={game.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {game.home_team.abbreviation} vs {game.away_team.abbreviation}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(game.start_time).toLocaleString()}
                  </div>
                </div>
              ))}
              {activeGames.count > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  And {activeGames.count - 5} more games...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
