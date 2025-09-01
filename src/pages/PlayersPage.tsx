
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlayerCard } from '@/components/PlayerCard';
import { Search, Users, RefreshCw } from 'lucide-react';
import { LeagueSelector } from '@/components/LeagueSelector';
import { useMultiLeagueProps } from '@/utils/multiLeagueUtils';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { useNavigate } from 'react-router-dom';

export const PlayersPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLeagues, setSelectedLeagues] = useState<('NBA' | 'NFL')[]>(['NBA']);
  const { props, isLoading, error, refetch, leagueDisplay } = useMultiLeagueProps(selectedLeagues);
  
  // PlayersPage render
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Get unique teams and positions from all selected leagues
  const teams = [...new Set((props || []).map(prop => prop.team))].sort();
  const positions = [...new Set((props || []).map(prop => prop.position))].filter(Boolean).sort();

  // Group props by player
  const playerData = (props || []).reduce((acc, prop) => {
    const playerId = prop.player_id;
    if (!acc[playerId]) {
      acc[playerId] = {
        playerId,
        playerName: prop.player_name,
        position: prop.position,
        team: prop.team,
        props: [],
        totalScore: 0,
        // Add prop type counts
        demonProps: 0,
        goblinProps: 0,
        standardProps: 0,
      };
    }
    acc[playerId].props.push(prop);
    acc[playerId].totalScore += prop.sorting_score;
    
    // Count prop types
    if (prop.odds_type === 'demon') {
      acc[playerId].demonProps++;
    } else if (prop.odds_type === 'goblin') {
      acc[playerId].goblinProps++;
    } else {
      acc[playerId].standardProps++;
    }
    
    return acc;
  }, {} as Record<string, any>);

  // Convert to array
  const players = Object.values(playerData).map((player: any) => ({
    ...player,
    totalProps: player.props.length,
  }));

  // Filter players
  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.playerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = selectedTeam === 'all' || player.team === selectedTeam;
    const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition;
    return matchesSearch && matchesTeam && matchesPosition;
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / itemsPerPage));
  const startIndex = Math.max(0, (currentPage - 1) * itemsPerPage);
  const endIndex = Math.min(startIndex + itemsPerPage, filteredPlayers.length);
  const currentPlayers = filteredPlayers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number | string) => {
    const actualItemsPerPage = newItemsPerPage === 'max' ? filteredPlayers.length : Number(newItemsPerPage);
    setItemsPerPage(actualItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Handle player card click
  const handlePlayerClick = (playerId: string) => {
    navigate(`/players/${playerId}`);
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTeam, selectedPosition, selectedLeagues]);

  // Ensure currentPage doesn't exceed totalPages
  React.useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  if (isLoading || !props) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading {leagueDisplay} players...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">Error loading players: {error.message}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

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
      {!props || props.length === 0 ? (
        <Card className="glass-card border border-slate-700">
          <CardContent className="text-center py-8">
            <p className="text-gray-400 mb-4">
              {isLoading ? 'Loading props data...' : 'No props data available.'}
            </p>
            {error && (
              <div className="text-red-400 mb-4">
                <p>Error: {error.message}</p>
                <Button onClick={() => refetch()} variant="outline" className="mt-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            )}
            {!isLoading && !error && (
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            )}
          </CardContent>
        </Card>
      ) : currentPlayers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentPlayers.map(player => (
            <div key={player.playerId} onClick={() => handlePlayerClick(player.playerId)}>
              <PlayerCard
                playerId={player.playerId}
                playerName={player.playerName}
                position={player.position}
                team={player.team}
                totalProps={player.totalProps}
                demonProps={player.demonProps}
                goblinProps={player.goblinProps}
                standardProps={player.standardProps}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card className="glass-card border border-slate-700">
          <CardContent className="text-center py-8">
            <p className="text-gray-400">No players found matching your criteria.</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {filteredPlayers.length > 0 && totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredPlayers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

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
