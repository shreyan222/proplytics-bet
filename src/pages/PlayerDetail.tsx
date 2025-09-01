
import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, RefreshCw } from 'lucide-react';
import { usePropsData } from '@/hooks/usePropsData';
import { PropsTable } from '@/components/PropsTable';

export const PlayerDetail: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user came from compare page
  const cameFromCompare = location.state?.from === 'compare';
  
  // Handle back navigation
  const handleBackNavigation = () => {
    if (cameFromCompare) {
      navigate('/compare');
    } else {
      navigate('/players');
    }
  };
  
  // Get all props from Supabase
  const { data: allProps = [], isLoading, error, refetch } = usePropsData();
  
  // Filter props for this player
  const playerProps = allProps.filter(prop => prop.player_id === playerId);
  
  // Enhance player props with calculated values if missing
  const enhancedPlayerProps = playerProps.map(prop => {
    // Calculate h2h_avg from array if missing
    let h2h_avg = prop.h2h_avg;
    if ((!h2h_avg || isNaN(h2h_avg)) && prop.h2h_array && prop.h2h_array.length > 0) {
      h2h_avg = prop.h2h_array.reduce((a, b) => a + b, 0) / prop.h2h_array.length;
    }
    
    // Calculate l5_avg from array if missing
    let l5_avg = prop.l5_avg;
    if ((!l5_avg || isNaN(l5_avg)) && prop.l5_array && prop.l5_array.length > 0) {
      l5_avg = prop.l5_array.reduce((a, b) => a + b, 0) / prop.l5_array.length;
    }
    
    // Calculate sorting_score if missing
    let sorting_score = prop.sorting_score;
    if ((!sorting_score || isNaN(sorting_score)) && prop.sorting_score_computed) {
      sorting_score = prop.sorting_score_computed;
    }
    
    return {
      ...prop,
      h2h_avg,
      l5_avg,
      sorting_score
    };
  });
  
  const playerInfo = enhancedPlayerProps[0];

  // Calculate player statistics
  const totalProps = playerProps.length;
  const demonProps = playerProps.filter(prop => prop.odds_type === 'demon').length;
  const goblinProps = playerProps.filter(prop => prop.odds_type === 'goblin').length;
  const standardProps = playerProps.filter(prop => prop.odds_type === 'standard').length;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={handleBackNavigation} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {cameFromCompare ? 'Back to Compare' : 'Back to Players'}
        </Button>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading player data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={handleBackNavigation} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {cameFromCompare ? 'Back to Compare' : 'Back to Players'}
        </Button>
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">Error loading player: {error.message}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!playerInfo && playerId) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={handleBackNavigation} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {cameFromCompare ? 'Back to Compare' : 'Back to Players'}
        </Button>
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">Player not found</p>
          <p className="text-sm text-muted-foreground mt-2">The player with ID "{playerId}" could not be found.</p>
        </div>
      </div>
    );
  }

  if (!playerInfo) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={handleBackNavigation} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {cameFromCompare ? 'Back to Compare' : 'Back to Players'}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBackNavigation}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {cameFromCompare ? 'Back to Compare' : 'Back to Players'}
        </Button>
      </div>

      {/* Player Info Card */}
      <Card className="glass-card border border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                <User className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">{playerInfo.player_name}</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{playerInfo.position}</Badge>
                  <Badge variant="outline">{playerInfo.team}</Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Total Props</p>
              <p className="text-2xl font-bold text-white">{totalProps}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-slate-700 rounded-lg bg-slate-800/50">
              <p className="text-sm text-slate-400">Total Props</p>
              <p className="text-xl font-semibold text-white">{totalProps}</p>
            </div>
            <div className="text-center p-4 border border-red-500/30 rounded-lg bg-red-500/10">
              <p className="text-sm text-slate-400">Demon Props</p>
              <p className="text-xl font-semibold text-red-400">{demonProps}</p>
            </div>
            <div className="text-center p-4 border border-green-500/30 rounded-lg bg-green-500/10">
              <p className="text-sm text-slate-400">Goblin Props</p>
              <p className="text-xl font-semibold text-green-400">{goblinProps}</p>
            </div>
            <div className="text-center p-4 border border-blue-500/30 rounded-lg bg-blue-500/10">
              <p className="text-sm text-slate-400">Standard Props</p>
              <p className="text-xl font-semibold text-blue-400">{standardProps}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Props Table - Using the same PropsTable component */}
      <Card className="glass-card border border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            All Props for {playerInfo.player_name} ({playerProps.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <PropsTable props={enhancedPlayerProps} viewMode="table" />
        </CardContent>
      </Card>
    </div>
  );
};
