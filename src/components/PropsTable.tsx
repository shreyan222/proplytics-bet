
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, ExternalLink, Clock, User, TrendingUp } from 'lucide-react';
import { Prop } from '@/types/nba';
import { format } from 'date-fns';

interface PropsTableProps {
  props: Prop[];
  viewMode?: 'table' | 'cards';
}

export const PropsTable: React.FC<PropsTableProps> = ({ props, viewMode = 'table' }) => {
  const [selectedProp, setSelectedProp] = useState<Prop | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (propId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(propId)) {
      newFavorites.delete(propId);
    } else {
      newFavorites.add(propId);
    }
    setFavorites(newFavorites);
  };

  const getOddsTypeBadge = (oddsType: string) => {
    switch (oddsType) {
      case 'demon':
        return <Badge className="bg-red-600 hover:bg-red-700">Demon</Badge>;
      case 'goblin':
        return <Badge className="bg-green-600 hover:bg-green-700">Goblin</Badge>;
      default:
        return <Badge variant="outline">Standard</Badge>;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      return format(new Date(timeString), 'h:mm a');
    } catch {
      return timeString;
    }
  };

  const PropDetailDialog = ({ prop }: { prop: Prop }) => (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          {viewMode === 'table' ? (
            <TableRow className="hover:bg-muted/50 transition-colors cursor-pointer">
              <TableCell className="font-medium flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                {prop.player_name}
              </TableCell>
              <TableCell>{prop.team}</TableCell>
              <TableCell>{prop.position}</TableCell>
              <TableCell>{prop.stat_type}</TableCell>
              <TableCell className="text-lg font-bold">{prop.line_score}</TableCell>
              <TableCell>{getOddsTypeBadge(prop.odds_type)}</TableCell>
              <TableCell>{formatTime(prop.start_time)}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ) : (
            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{prop.player_name}</h3>
                    <p className="text-sm text-muted-foreground">{prop.position} • {prop.team}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{prop.stat_type}</span>
                    {getOddsTypeBadge(prop.odds_type)}
                  </div>
                  <div className="text-2xl font-bold text-primary">{prop.line_score}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatTime(prop.start_time)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xl">{prop.player_name}</div>
              <div className="text-sm text-muted-foreground">{prop.team} • {prop.position}</div>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Stat Information */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Stat Type</div>
                <div className="text-2xl font-bold">{prop.stat_type}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Line Score</div>
                <div className="text-2xl font-bold text-primary">{prop.line_score}</div>
              </CardContent>
            </Card>
          </div>

          {/* Game Details */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Game Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Start Time:</span>
                  <div>{formatTime(prop.start_time)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Opponent:</span>
                  <div>{prop.against_team}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Odds Type:</span>
                  <div>{getOddsTypeBadge(prop.odds_type)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Sample Size:</span>
                  <div>{prop.sample_size} games</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Performance Analytics
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">H2H Average:</span>
                  <div className="font-medium">{prop.h2h_avg?.toFixed(1) || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">L5 Average:</span>
                  <div className="font-medium">{prop.l5_avg?.toFixed(1) || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">H2H Score:</span>
                  <div className="font-medium">{prop.h2h_score?.toFixed(1) || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Sorting Score:</span>
                  <div className="font-medium">{prop.sorting_score?.toFixed(1) || 'N/A'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant={favorites.has(prop.prop_id) ? "default" : "outline"}
              onClick={() => toggleFavorite(prop.prop_id)}
              className="flex-1"
            >
              <Heart className={`h-4 w-4 mr-2 ${favorites.has(prop.prop_id) ? 'fill-current' : ''}`} />
              {favorites.has(prop.prop_id) ? 'Favorited' : 'Add to Favorites'}
            </Button>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (viewMode === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {props.map((prop) => (
          <PropDetailDialog key={prop.prop_id} prop={prop} />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Stat Type</TableHead>
            <TableHead>Line Score</TableHead>
            <TableHead>Odds Type</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.map((prop) => (
            <PropDetailDialog key={prop.prop_id} prop={prop} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
