
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
    switch (oddsType.toLowerCase()) {
      case 'demon':
        return <Badge variant="demon">Demon</Badge>;
      case 'goblin':
        return <Badge variant="goblin">Goblin</Badge>;
      case 'standard':
      default:
        return <Badge variant="standard">Standard</Badge>;
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
        <div className="cursor-pointer w-full">
          {viewMode === 'table' ? (
            <TableRow className="hover:bg-slate-800/50 transition-all duration-300 cursor-pointer border-b border-slate-700 group">
              <TableCell className="py-4 align-middle">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="font-medium text-white group-hover:text-blue-400 transition-colors">{prop.player_name}</span>
                </div>
              </TableCell>
              <TableCell className="text-slate-300 align-middle">{prop.team}</TableCell>
              <TableCell className="text-slate-300 align-middle">{prop.position}</TableCell>
              <TableCell className="text-slate-300 align-middle">{prop.stat_type}</TableCell>
              <TableCell className="text-center align-middle font-bold text-xl text-blue-400">{prop.line_score}</TableCell>
              <TableCell className="text-center align-middle">
                <div className="flex justify-center">{getOddsTypeBadge(prop.odds_type)}</div>
              </TableCell>
              <TableCell className="text-center align-middle text-slate-300">{formatTime(prop.start_time)}</TableCell>
              <TableCell className="text-center align-middle">
                <div className="flex justify-center">
                  <Button variant="outline" size="sm" className="glass-button text-white border-blue-500/30 hover:border-blue-400/50 hover:text-blue-400">
                    View Details
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            <Card className="glass-card hover:scale-105 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30 group-hover:border-blue-400/50 transition-colors">
                    <User className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{prop.player_name}</h3>
                    <p className="text-sm text-slate-400">{prop.position} • {prop.team}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">{prop.stat_type}</span>
                    {getOddsTypeBadge(prop.odds_type)}
                  </div>
                  <div className="text-3xl font-bold text-blue-400">{prop.line_score}</div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="h-4 w-4" />
                    {formatTime(prop.start_time)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl glass border border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
              <User className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <div className="text-xl text-white">{prop.player_name}</div>
              <div className="text-sm text-slate-400">{prop.team} • {prop.position}</div>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Stat Information */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="text-sm text-slate-400 mb-1">Stat Type</div>
                <div className="text-2xl font-bold text-white">{prop.stat_type}</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="text-sm text-slate-400 mb-1">Line Score</div>
                <div className="text-2xl font-bold text-blue-400">{prop.line_score}</div>
              </CardContent>
            </Card>
          </div>

          {/* Game Details */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 text-white">Game Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Start Time:</span>
                  <div className="text-white">{formatTime(prop.start_time)}</div>
                </div>
                <div>
                  <span className="text-slate-400">Opponent:</span>
                  <div className="text-white">{prop.against_team}</div>
                </div>
                <div>
                  <span className="text-slate-400">Odds Type:</span>
                  <div>{getOddsTypeBadge(prop.odds_type)}</div>
                </div>
                <div>
                  <span className="text-slate-400">Sample Size:</span>
                  <div className="text-white">{prop.sample_size} games</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-white">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                Performance Analytics
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">H2H Average:</span>
                  <div className="font-medium text-white">{prop.h2h_avg?.toFixed(1) || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-slate-400">L5 Average:</span>
                  <div className="font-medium text-white">{prop.l5_avg?.toFixed(1) || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-slate-400">H2H Score:</span>
                  <div className="font-medium text-white">{prop.h2h_score?.toFixed(1) || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-slate-400">Sorting Score:</span>
                  <div className="font-medium text-white">{prop.sorting_score?.toFixed(1) || 'N/A'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant={favorites.has(prop.prop_id) ? "default" : "outline"}
              onClick={() => toggleFavorite(prop.prop_id)}
              className={`flex-1 ${favorites.has(prop.prop_id) ? 'bg-blue-600 hover:bg-blue-700' : 'glass-button border-blue-500/30 text-white hover:border-blue-400/50'}`}
            >
              <Heart className={`h-4 w-4 mr-2 ${favorites.has(prop.prop_id) ? 'fill-current' : ''}`} />
              {favorites.has(prop.prop_id) ? 'Favorited' : 'Add to Favorites'}
            </Button>
            <Button className="glass-button border-blue-500/30 text-white hover:border-blue-400/50">
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
    <div className="glass-card border border-slate-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-slate-700 hover:bg-slate-800/30">
            <TableHead className="text-slate-300 font-semibold h-12 align-middle">Player</TableHead>
            <TableHead className="text-slate-300 font-semibold h-12 align-middle">Team</TableHead>
            <TableHead className="text-slate-300 font-semibold h-12 align-middle">Position</TableHead>
            <TableHead className="text-slate-300 font-semibold h-12 align-middle">Stat Type</TableHead>
            <TableHead className="text-center text-slate-300 font-semibold h-12 align-middle">Line Score</TableHead>
            <TableHead className="text-center text-slate-300 font-semibold h-12 align-middle">Odds Type</TableHead>
            <TableHead className="text-center text-slate-300 font-semibold h-12 align-middle">Start Time</TableHead>
            <TableHead className="text-center text-slate-300 font-semibold h-12 align-middle">Actions</TableHead>
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
