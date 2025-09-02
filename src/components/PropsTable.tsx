import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, ExternalLink, Clock, User, TrendingUp, ArrowUpDown, ArrowUp, ArrowDown, Target, BarChart3 } from 'lucide-react';
import { Prop } from '@/types/nba';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

interface PropsTableProps {
  props: Prop[];
  viewMode?: 'table' | 'cards';
}

type SortField = 'player_name' | 'team' | 'against_team' | 'position' | 'stat_type' | 'line_score' | 'h2h_avg' | 'l5_avg' | 'matchup_rank' | 'sorting_score' | 'odds_type' | 'start_time';
type SortDirection = 'asc' | 'desc';

export const PropsTable: React.FC<PropsTableProps> = ({ props, viewMode = 'table' }) => {
  const [selectedProp, setSelectedProp] = useState<Prop | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortField, setSortField] = useState<SortField>('sorting_score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  // Add league filter to your table
  const [selectedLeague, setSelectedLeague] = useState<'all' | 'NBA' | 'NFL'>('all');

  const toggleFavorite = (propId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(propId)) {
      newFavorites.delete(propId);
    } else {
      newFavorites.add(propId);
    }
    setFavorites(newFavorites);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set it as the sort field with default direction
      setSortField(field);
      // Set default direction based on field type
      if (field === 'player_name' || field === 'team' || field === 'against_team' || field === 'position' || field === 'stat_type' || field === 'odds_type') {
        setSortDirection('asc'); // Alphabetical fields default to ascending
      } else {
        setSortDirection('desc'); // Numeric fields default to descending
      }
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-slate-400" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4 text-blue-400 font-bold" /> : 
      <ArrowDown className="h-4 w-4 text-blue-400 font-bold" />;
  };

  const getSortableHeader = (field: SortField, label: string, className?: string) => (
    <div 
      className={cn(
        "flex items-center gap-2 cursor-pointer hover:text-blue-400 transition-colors select-none",
        sortField === field && "text-blue-400 font-semibold",
        className
      )}
      onClick={() => handleSort(field)}
    >
      {label}
      {getSortIcon(field)}
    </div>
  );

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

  const getMatchupScoreColor = (rank: number | null | undefined) => {
    if (!rank || rank <= 0) return 'text-slate-400'; // Gray for N/A or invalid values
    
    // Color gradient based on rank (1-32)
    if (rank <= 8) return 'text-green-400'; // Top 25% - Green
    if (rank <= 16) return 'text-yellow-400'; // 25-50% - Yellow
    if (rank <= 24) return 'text-orange-400'; // 50-75% - Orange
    return 'text-red-400'; // Bottom 25% - Red
  };

  const getMatchupScoreBackground = (rank: number | null | undefined) => {
    if (!rank || rank <= 0) return 'bg-slate-500/20'; // Gray background for N/A
    
    // Background gradient based on rank (1-32)
    if (rank <= 8) return 'bg-green-500/20'; // Top 25% - Green
    if (rank <= 16) return 'bg-yellow-500/20'; // 25-50% - Yellow
    if (rank <= 24) return 'bg-orange-500/20'; // 50-75% - Orange
    return 'bg-red-500/20'; // Bottom 25% - Red
  };

  const formatMatchupScore = (rank: number | null | undefined) => {
    if (!rank || rank <= 0) return 'N/A';
    return `${rank}/32`;
  };

  // Filter props by league first
  const filteredProps = useMemo(() => {
    if (selectedLeague === 'all') return props;
    return props.filter(prop => prop.league === selectedLeague);
  }, [props, selectedLeague]);

  // Then sort the filtered props
  const sortedProps = useMemo(() => {
    return [...filteredProps].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'player_name':
          aValue = a.player_name.toLowerCase();
          bValue = b.player_name.toLowerCase();
          break;
        case 'team':
          aValue = a.team.toLowerCase();
          bValue = b.team.toLowerCase();
          break;
        case 'against_team':
          aValue = a.against_team.toLowerCase();
          bValue = b.against_team.toLowerCase();
          break;
        case 'position':
          aValue = a.position.toLowerCase();
          bValue = b.position.toLowerCase();
          break;
        case 'stat_type':
          aValue = a.stat_type.toLowerCase();
          bValue = b.stat_type.toLowerCase();
          break;
        case 'line_score':
          aValue = Number(a.line_score);
          bValue = Number(b.line_score);
          break;
        case 'h2h_avg':
          aValue = Number(a.h2h_avg) || 0;
          bValue = Number(b.h2h_avg) || 0;
          break;
        case 'l5_avg':
          aValue = Number(a.l5_avg) || 0;
          bValue = Number(b.l5_avg) || 0;
          break;
        case 'matchup_rank':
          aValue = Number(a.matchup_rank) || 0;
          bValue = Number(b.matchup_rank) || 0;
          break;
        case 'sorting_score':
          aValue = Number(a.sorting_score) || 0;
          bValue = Number(b.sorting_score) || 0;
          break;
        case 'odds_type':
          aValue = a.odds_type.toLowerCase();
          bValue = b.odds_type.toLowerCase();
          break;
        case 'start_time':
          aValue = new Date(a.start_time).getTime();
          bValue = new Date(b.start_time).getTime();
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [filteredProps, sortField, sortDirection]);

  // Pagination logic using sortedProps
  const totalPages = Math.ceil(sortedProps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProps = useMemo(() => {
    return sortedProps.slice(startIndex, endIndex);
  }, [sortedProps, startIndex, endIndex]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number | string) => {
    // Handle "max" option to show all items
    const actualItemsPerPage = newItemsPerPage === 'max' ? filteredProps.length : Number(newItemsPerPage);
    setItemsPerPage(actualItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Component for card view mode
  const PropCard = ({ prop }: { prop: Prop }) => (
    <Card 
      className={cn(
        "hover:scale-105 transition-all duration-300 cursor-pointer group",
        prop.odds_type === "goblin" && "bg-green-500/5 hover:bg-green-500/10",
        prop.odds_type === "demon" && "bg-red-500/5 hover:bg-red-500/10",
        prop.odds_type === "standard" && "bg-blue-500/5 hover:bg-blue-500/10"
      )}
      onClick={() => setSelectedProp(prop)}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30 group-hover:border-blue-400/50 transition-colors">
            <User className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{prop.player_name}</h3>
            <p className="text-sm text-slate-400">{prop.position} • {prop.team}</p>
            <p className="text-xs text-slate-500">vs {prop.against_team}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">{prop.stat_type}</span>
            {getOddsTypeBadge(prop.odds_type)}
          </div>
          <div className="text-3xl font-bold text-blue-400">{prop.line_score}</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-slate-400">H2H Avg:</span>
              <div className="font-semibold text-blue-400">
                {prop.h2h_avg ? prop.h2h_avg.toFixed(1) : 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-slate-400">L5 Avg:</span>
              <div className="font-semibold text-blue-400">
                {prop.l5_avg ? prop.l5_avg.toFixed(1) : 'N/A'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock className="h-4 w-4" />
            {formatTime(prop.start_time)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Component for detailed stats dialog
  const PropDetailDialog = ({ prop }: { prop: Prop }) => {
    const [selectedGraph, setSelectedGraph] = useState<'h2h' | 'l5'>('h2h');

    return (
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
                <div className="text-sm text-slate-400 mb-1">Stat</div>
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

          {/* Matchup Rank & Game Info */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  Matchup Analysis
                </h3>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-sm text-slate-400">Matchup Rank</div>
                    <div className={cn(
                      "text-2xl font-bold px-3 py-2 rounded-lg",
                      getMatchupScoreColor(prop.matchup_rank),
                      getMatchupScoreBackground(prop.matchup_rank)
                    )}>
                      {formatMatchupScore(prop.matchup_rank)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-400">Line Score</div>
                    <div className="text-2xl font-bold text-blue-400">{prop.line_score}</div>
                  </div>
                </div>
              </div>
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

          {/* Performance Bar Graphs with Toggle */}
          <Card className="glass-card">
            <CardContent className="p-6">
              {/* Toggle Buttons */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  Performance Analysis
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant={selectedGraph === 'h2h' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedGraph('h2h')}
                    className={cn(
                      selectedGraph === 'h2h' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'glass-button border-blue-500/30 text-white hover:border-blue-400/50'
                    )}
                  >
                    H2H ({prop.h2h_avg?.toFixed(1) || 'N/A'})
                  </Button>
                  <Button
                    variant={selectedGraph === 'l5' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedGraph('l5')}
                    className={cn(
                      selectedGraph === 'l5' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'glass-button border-green-500/30 text-white hover:border-green-400/50'
                    )}
                  >
                    L5 ({prop.l5_avg?.toFixed(1) || 'N/A'})
                  </Button>
                </div>
              </div>

               {/* H2H Performance Graph */}
               {selectedGraph === 'h2h' && (
                 <div className="space-y-4">
                   <div className="text-center mb-4">
                     <div className="text-sm text-slate-400">Head-to-Head Performance</div>
                     <div className="text-lg font-bold text-blue-400">{prop.h2h_avg?.toFixed(1) || 'N/A'}</div>
                   </div>
                   
                   {prop.h2h_array && prop.h2h_array.length > 0 ? (
                     <div className="bg-slate-800/50 rounded-lg p-4">
                       {/* Recharts Bar Chart */}
                       <div className="h-64 mb-4">
                         <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={prop.h2h_array.map((score, idx) => ({
                             game: `G${idx + 1}`,
                             performance: score,
                             color: score >= prop.line_score ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)',
                             borderColor: score >= prop.line_score ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                           }))} margin={{ top: 20, right: 60, left: 20, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke="rgba(71, 85, 105, 0.3)" />
                             <XAxis 
                               dataKey="game" 
                               stroke="rgb(148, 163, 184)"
                               fontSize={12}
                             />
                             <YAxis 
                               stroke="rgb(148, 163, 184)"
                               fontSize={12}
                               domain={[0, 'dataMax + 1']}
                               tickFormatter={(value) => value.toFixed(1)}
                               label={{ 
                                 value: `${prop.stat_type}`, 
                                 angle: -90, 
                                 position: 'insideLeft',
                                 style: { textAnchor: 'middle', fill: 'rgb(148, 163, 184)' }
                               }}
                             />
                             <Tooltip
                               contentStyle={{
                                 backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                 border: '1px solid rgb(71, 85, 105)',
                                 borderRadius: '8px',
                                 color: 'white'
                               }}
                               labelStyle={{ color: 'rgb(148, 163, 184)' }}
                               formatter={(value, name) => [`${value} ${prop.stat_type}`, 'Performance']}
                             />
                             <ReferenceLine 
                               y={prop.line_score} 
                               stroke="rgb(74, 222, 128)" 
                               strokeDasharray="6 4"
                               strokeWidth={2}
                               label={{ 
                                 value: `Line: ${prop.line_score}`, 
                                 position: 'insideRight',
                                 fill: 'rgb(74, 222, 128)',
                                 fontSize: 11,
                                 fontWeight: 'bold',
                                 offset: 10
                               }}
                             />
                             <Bar 
                               dataKey="performance" 
                               radius={4}
                               fill="currentColor"
                             >
                               {prop.h2h_array.map((score, index) => (
                                 <Cell key={`cell-${index}`} fill={score >= prop.line_score ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'} />
                               ))}
                             </Bar>
                           </BarChart>
                         </ResponsiveContainer>
                       </div>
                       
                       {/* Summary Stats */}
                       <div className="grid grid-cols-2 gap-4 text-sm">
                         <div className="text-center">
                           <div className="text-slate-400">Over Line</div>
                           <div className="text-green-400 font-semibold text-lg">
                             {prop.h2h_array.filter(score => score >= prop.line_score).length}/{prop.h2h_array.length}
                           </div>
                         </div>
                         <div className="text-center">
                           <div className="text-slate-400">Under Line</div>
                           <div className="text-red-400 font-semibold text-lg">
                             {prop.h2h_array.filter(score => score < prop.line_score).length}/{prop.h2h_array.length}
                           </div>
                         </div>
                       </div>
                     </div>
                   ) : (
                     <div className="text-center text-slate-500 py-8">No H2H data available</div>
                   )}
                 </div>
               )}

               {/* L5 Performance Graph */}
               {selectedGraph === 'l5' && (
                 <div className="space-y-4">
                   <div className="text-center mb-4">
                     <div className="text-sm text-slate-400">Last 5 Games Performance</div>
                     <div className="text-lg font-bold text-green-400">{prop.l5_avg?.toFixed(1) || 'N/A'}</div>
                   </div>
                   
                   {prop.l5_array && prop.l5_array.length > 0 ? (
                     <div className="bg-slate-800/50 rounded-lg p-4">
                       {/* Recharts Bar Chart */}
                       <div className="h-64 mb-4">
                         <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={prop.l5_array.map((score, idx) => ({
                             game: `G${idx + 1}`,
                             performance: score,
                             color: score >= prop.line_score ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)',
                             borderColor: score >= prop.line_score ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                           }))} margin={{ top: 20, right: 60, left: 20, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke="rgba(71, 85, 105, 0.3)" />
                             <XAxis 
                               dataKey="game" 
                               stroke="rgb(148, 163, 184)"
                               fontSize={12}
                             />
                             <YAxis 
                               stroke="rgb(148, 163, 184)"
                               fontSize={12}
                               domain={[0, 'dataMax + 1']}
                               tickFormatter={(value) => value.toFixed(1)}
                               label={{ 
                                 value: `${prop.stat_type}`, 
                                 angle: -90, 
                                 position: 'insideLeft',
                                 style: { textAnchor: 'middle', fill: 'rgb(148, 163, 184)' }
                               }}
                             />
                             <Tooltip
                               contentStyle={{
                                 backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                 border: '1px solid rgb(71, 85, 105)',
                                 borderRadius: '8px',
                                 color: 'white'
                               }}
                               labelStyle={{ color: 'rgb(148, 163, 184)' }}
                               formatter={(value, name) => [`${value}`, 'Performance']}
                             />
                             <ReferenceLine 
                               y={prop.line_score} 
                               stroke="rgb(74, 222, 128)" 
                               strokeDasharray="6 4"
                               strokeWidth={2}
                               label={{ 
                                 value: `Line: ${prop.line_score}`, 
                                 position: 'insideRight',
                                 fill: 'rgb(74, 222, 128)',
                                 fontSize: 11,
                                 fontWeight: 'bold',
                                 offset: 10
                               }}
                             />
                             <Bar 
                               dataKey="performance" 
                               radius={4}
                               fill="currentColor"
                             >
                               {prop.l5_array.map((score, index) => (
                                 <Cell key={`cell-${index}`} fill={score >= prop.line_score ? 'rgba(34, 197, 94, 0.8)' : 'rgb(239, 68, 68, 0.8)'} />
                               ))}
                             </Bar>
                           </BarChart>
                         </ResponsiveContainer>
                       </div>
                       
                       {/* Summary Stats */}
                       <div className="grid grid-cols-2 gap-4 text-sm">
                         <div className="text-center">
                           <div className="text-slate-400">Over Line</div>
                           <div className="text-green-400 font-semibold text-lg">
                             {prop.l5_array.filter(score => score >= prop.line_score).length}/{prop.l5_array.length}
                           </div>
                         </div>
                         <div className="text-center">
                           <div className="text-slate-400">Under Line</div>
                           <div className="text-red-400 font-semibold text-lg">
                             {prop.l5_array.filter(score => score < prop.line_score).length}/{prop.l5_array.length}
                           </div>
                         </div>
                       </div>
                     </div>
                   ) : (
                     <div className="text-center text-slate-500 py-8">No L5 data available</div>
                   )}
                 </div>
               )}


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
    );
  };

  if (viewMode === 'cards') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentProps.map((prop) => (
            <PropCard key={prop.prop_id} prop={prop} />
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProps.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    );
  }

  return (
    <div className="glass-card border border-slate-700 overflow-hidden">
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-700 hover:bg-slate-800/30">
            <TableHead className="px-4 py-3 text-left text-slate-300 font-semibold">
              {getSortableHeader('player_name', 'Player')}
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-slate-300 font-semibold">
              {getSortableHeader('team', 'Team')}
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-slate-300 font-semibold">
              {getSortableHeader('against_team', 'vs Team')}
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-slate-300 font-semibold">
              {getSortableHeader('position', 'Pos')}
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-slate-300 font-semibold">
              {getSortableHeader('stat_type', 'Stat')}
            </TableHead>
            <TableHead className="px-4 py-3 text-center text-slate-300 font-semibold">
              {getSortableHeader('line_score', 'Line')}
            </TableHead>
            <TableHead className="px-4 py-3 text-center text-slate-300 font-semibold">
              {getSortableHeader('h2h_avg', 'H2H Avg')}
            </TableHead>
            <TableHead className="px-4 py-3 text-center text-slate-300 font-semibold">
              {getSortableHeader('l5_avg', 'L5 Avg')}
            </TableHead>
            <TableHead className="px-4 py-3 text-center text-slate-300 font-semibold">
              {getSortableHeader('matchup_rank', 'Matchup Score')}
            </TableHead>
            <TableHead className="px-4 py-3 text-center text-slate-300 font-semibold">
              {getSortableHeader('sorting_score', 'Prop Score')}
            </TableHead>
            <TableHead className="px-4 py-3 text-center text-slate-300 font-semibold">
              {getSortableHeader('odds_type', 'Odds Type')}
            </TableHead>
            <TableHead className="px-4 py-3 text-center text-slate-300 font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentProps.map((prop) => (
            <TableRow
              key={prop.prop_id}
              className={cn(
                "transition-all duration-300 border-b border-slate-700 group",
                // Base hover state
                "hover:bg-slate-800/50",
                // Odds type specific backgrounds
                prop.odds_type === "goblin" && "bg-green-500/10 hover:bg-green-500/20",
                prop.odds_type === "demon" && "bg-red-500/10 hover:bg-red-500/20", 
                prop.odds_type === "standard" && "bg-blue-500/5 hover:bg-blue-500/10"
              )}
            >
              <TableCell className="px-4 py-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="font-medium text-white group-hover:text-blue-400 transition-colors">{prop.player_name}</span>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-left text-slate-300">{prop.team}</TableCell>
              <TableCell className="px-4 py-3 text-left text-slate-300">{prop.against_team}</TableCell>
              <TableCell className="px-4 py-3 text-left text-slate-300">{prop.position}</TableCell>
              <TableCell className="px-4 py-3 text-left text-slate-300">{prop.stat_type}</TableCell>
              <TableCell
                className={cn(
                  "px-4 py-3 text-center font-bold text-xl",
                  prop.odds_type === "demon" && "text-red-500",
                  prop.odds_type === "goblin" && "text-green-400",
                  prop.odds_type === "standard" && "text-blue-500"
                )}
              >
                {prop.line_score}
              </TableCell>
              <TableCell className="px-4 py-3 text-center">
                <div className={cn(
                  "text-lg font-semibold flex items-center justify-center gap-2",
                  // Highlight H2H average when ALL games are above the line score and array size > 3
                  prop.h2h_array && prop.line_score && prop.h2h_array.length > 2 && prop.h2h_array.every(score => score >= prop.line_score)
                    ? "text-yellow-400 bg-yellow-500/20 px-3 py-1 rounded-lg border border-yellow-500/30"
                    : "text-blue-400"
                )}>
                  {prop.h2h_avg ? (
                    <>
                      {prop.h2h_avg.toFixed(2)}
                      {/* Show fire emoji when ALL H2H games are above the line score and array size > 3 */}
                      {prop.h2h_array && prop.line_score && prop.h2h_array.length > 3 && prop.h2h_array.every(score => score >= prop.line_score) && (
                        <span className="text-yellow-400 text-lg" title="Cash all games! All H2H games above line (min 4 games)">
                          🔥
                        </span>
                      )}
                    </>
                  ) : (
                    'N/A'
                  )}
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-center">
                <div className={cn(
                  "text-lg font-semibold flex items-center justify-center gap-2",
                  // Highlight L5 average when ALL 5 games are above the line score
                  prop.l5_array && prop.line_score && prop.l5_array.length === 5 && prop.l5_array.every(score => score >= prop.line_score)
                    ? "text-yellow-400 bg-yellow-500/20 px-3 py-1 rounded-lg border border-yellow-500/30"
                    : "text-blue-400"
                )}>
                  {prop.l5_avg ? (
                    <>
                      {prop.l5_avg.toFixed(2)}
                      {/* Show fire emoji when ALL 5 games are above the line score */}
                      {prop.l5_array && prop.line_score && prop.l5_array.length === 5 && prop.l5_array.every(score => score >= prop.line_score) && (
                        <span className="text-yellow-400 text-lg" title="Cash all games! All 5 L5 games above line">
                          🔥
                        </span>
                      )}
                    </>
                  ) : (
                    'N/A'
                  )}
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-center">
                <div className={cn(
                  "inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold",
                  getMatchupScoreBackground(prop.matchup_rank),
                  getMatchupScoreColor(prop.matchup_rank)
                )}>
                  {formatMatchupScore(prop.matchup_rank)}
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{((prop.sorting_score * 9)?.toFixed(3)) || 'N/A'}</div>
              </TableCell>
              <TableCell className="px-4 py-3 text-center">
                {getOddsTypeBadge(prop.odds_type)}
              </TableCell>
              <TableCell className="px-4 py-3 text-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="glass-button text-white border-blue-500/30 hover:border-blue-400/50 hover:text-blue-400"
                  onClick={() => setSelectedProp(prop)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
        </div>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredProps.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
      {selectedProp && (
        <Dialog open={true} onOpenChange={() => setSelectedProp(null)}>
          <PropDetailDialog prop={selectedProp} />
        </Dialog>
      )}
    </div>
  );
};
