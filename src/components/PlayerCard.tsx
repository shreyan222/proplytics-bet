
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PlayerCardProps {
  playerId: string;
  playerName: string;
  position: string;
  team: string;
  totalProps: number;
  avgScore: number;
  recentPerformance: 'up' | 'down' | 'stable';
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  playerId,
  playerName,
  position,
  team,
  totalProps,
  avgScore,
  recentPerformance,
}) => {
  const navigate = useNavigate();

  const getTrendIcon = () => {
    if (recentPerformance === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (recentPerformance === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <User className="h-4 w-4 text-gray-500" />;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/players/${playerId}`)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{playerName}</span>
          {getTrendIcon()}
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="secondary">{position}</Badge>
          <Badge variant="outline">{team}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Props</p>
            <p className="font-semibold">{totalProps}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Avg Score</p>
            <p className="font-semibold">{avgScore.toFixed(2)}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full mt-4">
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};
