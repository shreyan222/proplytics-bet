
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlayerCard } from '@/components/PlayerCard';
import { Search, Users } from 'lucide-react';
import { LeagueSelector } from '@/components/LeagueSelector';
import { getPropsForMultipleLeagues, getSelectedLeaguesDisplay } from '@/utils/multiLeagueUtils';

export const PlayersPage: React.FC = () => {
  const [selectedLeagues, setSelectedLeagues] = useState<('NBA' | 'NFL' | 'MLB')[]>(['NBA']);
  const props = getPropsForMultipleLeagues(selectedLeagues);
  const leagueDisplay = getSelectedLeaguesDisplay(selectedLeagues);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');

  // Get unique teams and positions from all selected leagues
  const teams = [...new Set(props.map(prop => prop.team))].sort();
  const positions = [...new Set(props.map(prop => prop.position))].filter(Boolean).sort();

  // Group props by player
  const playerData = props.reduce((acc, prop) => {
    const playerId = prop.player_id;
    if (!acc[playerId]) {
      acc[playerId] = {
        playerId,
        playerName: prop.player_name,
        position: prop.position,
        team: prop.team,
        props: [],
        totalScore: 0,
      };
    }
    acc[playerId].props.push(prop);
    acc[playerId].totalScore += prop.sorting_score;
    return acc;
  }, {} as Record<string, any>);

  // Convert to array and calculate averages
  const players = Object.values(playerData).map((player: any) => ({
    ...player,
    totalProps: player.props.length,
    avgScore: player.totalScore / player.props.length,
    recentPerformance: Math.random() > 0.33 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable' as 'up' | 'down' | 'stable',
  }));

  // Filter players
  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.playerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = selectedTeam === 'all' || player.team === selectedTeam;
    const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition;
    return matchesSearch && matchesTeam && matchesPosition;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* League Selector */}
      <LeagueSelector
        selectedLeagues={selectedLeagues}
        onLeaguesChange={setSelectedLeagues}
      />

      {/* Header */}
      <Card className="glass-card border border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5" />
            {leagueDisplay} Players ({filteredPlayers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-white bg-slate-800 border-slate-600"
              />
            </div>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="text-white bg-slate-800 border-slate-600">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="text-white bg-slate-800 border-slate-600">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {positions.map(position => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPlayers.map(player => (
          <PlayerCard
            key={player.playerId}
            playerId={player.playerId}
            playerName={player.playerName}
            position={player.position}
            team={player.team}
            totalProps={player.totalProps}
            avgScore={player.avgScore}
            recentPerformance={player.recentPerformance}
          />
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <Card className="glass-card border border-slate-700">
          <CardContent className="text-center py-8">
            <p className="text-gray-400">No {leagueDisplay} players found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
