import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface TrackerPropsTableProps {
  data: any[];
  type: 'new' | 'removed' | 'modified';
  viewMode: 'table' | 'cards';
  searchQuery: string;
  filters: {
    team: string;
    statType: string;
    oddsType: string;
  };
}

export const TrackerPropsTable: React.FC<TrackerPropsTableProps> = ({
  data,
  type,
  viewMode,
  searchQuery,
  filters
}) => {
  const [selectedProp, setSelectedProp] = useState<any>(null);

  const filteredData = data.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item['Display Name']?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item['Team Name']?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item['Stat Type']?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.Player?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.Team?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTeam = filters.team === 'all' || 
      item['Team Name'] === filters.team || 
      item.Team === filters.team;

    const matchesStat = filters.statType === 'all' || 
      item['Stat Type'] === filters.statType;

    const matchesOdds = filters.oddsType === 'all' || 
      item['Odds Type'] === filters.oddsType;

    return matchesSearch && matchesTeam && matchesStat && matchesOdds;
  });

  const getOddsBadgeColor = (oddsType: string) => {
    switch (oddsType?.toLowerCase()) {
      case 'demon': return 'bg-red-600 hover:bg-red-700';
      case 'goblin': return 'bg-green-600 hover:bg-green-700';
      case 'standard': return 'bg-blue-600 hover:bg-blue-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'new': return 'border-green-500 bg-green-50 dark:bg-green-950/50';
      case 'removed': return 'border-red-500 bg-red-50 dark:bg-red-950/50';
      case 'modified': return 'border-orange-500 bg-orange-50 dark:bg-orange-950/50';
      default: return '';
    }
  };

  const formatTimeUntilGame = (startTime: string) => {
    const gameTime = new Date(startTime);
    const now = new Date();
    const diff = gameTime.getTime() - now.getTime();
    
    if (diff < 0) return 'Started';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (viewMode === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.map((item, index) => (
          <Dialog key={index}>
            <DialogTrigger asChild>
              <Card className={`cursor-pointer hover:shadow-lg transition-all ${getTypeColor(type)} border-l-4`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`/placeholder-avatar.png`} />
                        <AvatarFallback>
                          {(item['Display Name'] || item.Player)?.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-sm">{item['Display Name'] || item.Player}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {item['Team Name'] || item.Team} • {item.Position}
                        </p>
                      </div>
                    </div>
                    <Badge className={getOddsBadgeColor(item['Odds Type'])}>
                      {item['Odds Type']?.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-center">
                      <p className="text-lg font-bold">{item['Stat Type']}</p>
                      <p className="text-2xl font-bold text-primary">
                        {type === 'modified' && item.Changes?.['Line Score'] ? 
                          `${item.Changes['Line Score'].previous} → ${item.Changes['Line Score'].current}` :
                          item['Line Score']
                        }
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTimeUntilGame(item['Start Time'])}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{item['Display Name'] || item.Player}</DialogTitle>
                <DialogDescription>
                  {item['Team Name'] || item.Team} • {item.Position}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Stat Type</p>
                    <p className="text-lg">{item['Stat Type']}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Line Score</p>
                    <p className="text-lg font-bold">
                      {type === 'modified' && item.Changes?.['Line Score'] ? 
                        `${item.Changes['Line Score'].previous} → ${item.Changes['Line Score'].current}` :
                        item['Line Score']
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Odds Type</p>
                    <Badge className={getOddsBadgeColor(item['Odds Type'])}>
                      {item['Odds Type']?.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Game Time</p>
                    <p className="text-sm">{formatTimeUntilGame(item['Start Time'])}</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    );
  }

  return (
    <Card className={`${getTypeColor(type)} border border-border bg-card rounded-lg overflow-hidden`}>
      <CardHeader className="border-b border-border">
        <CardTitle className="capitalize text-foreground">{type} Props ({filteredData.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-background">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-muted/5">
                <TableHead className="text-muted-foreground font-medium">Player</TableHead>
                <TableHead className="text-muted-foreground font-medium">Team</TableHead>
                <TableHead className="text-muted-foreground font-medium">Position</TableHead>
                <TableHead className="text-muted-foreground font-medium">Stat Type</TableHead>
                <TableHead className="text-muted-foreground font-medium">Line Score</TableHead>
                <TableHead className="text-muted-foreground font-medium">Odds Type</TableHead>
                <TableHead className="text-muted-foreground font-medium">Game Time</TableHead>
                <TableHead className="text-muted-foreground font-medium">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow key={index} className="border-b border-border/50 hover:bg-muted/5 transition-colors">
                  <TableCell className="text-foreground">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/placeholder-avatar.png`} />
                        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                          {(item['Display Name'] || item.Player)?.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{item['Display Name'] || item.Player}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{item['Team Name'] || item.Team}</TableCell>
                  <TableCell className="text-foreground">{item.Position}</TableCell>
                  <TableCell className="text-foreground">{item['Stat Type']}</TableCell>
                  <TableCell className="font-bold text-foreground">
                    {type === 'modified' && item.Changes?.['Line Score'] ? (
                      <div className="flex items-center gap-2">
                        <span className="text-red-400">{item.Changes['Line Score'].previous}</span>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-green-400">{item.Changes['Line Score'].current}</span>
                      </div>
                    ) : (
                      item['Line Score']
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getOddsBadgeColor(item['Odds Type'])}>
                      {item['Odds Type']?.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {formatTimeUntilGame(item['Start Time'])}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-foreground border-border hover:bg-muted">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{item['Display Name'] || item.Player}</DialogTitle>
                          <DialogDescription>Detailed prop information</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Team</p>
                              <p>{item['Team Name'] || item.Team}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Position</p>
                              <p>{item.Position}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Stat Type</p>
                              <p>{item['Stat Type']}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Line Score</p>
                              <p className="text-lg font-bold">{item['Line Score']}</p>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
