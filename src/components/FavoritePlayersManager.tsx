
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { usePropsData } from '@/hooks/usePropsData';
import { useToast } from '@/hooks/use-toast';
import { Users, X, Plus, Search } from 'lucide-react';

export const FavoritePlayersManager: React.FC = () => {
  const { preferences, updatePreferences } = useUserPreferences();
  const { data } = usePropsData();
  const props = data?.props ?? [];
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique players from props data
  const availablePlayers = Array.from(
    new Set(props.map(prop => prop.player_name))
  ).filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()));

  const favoritePlayerIds = preferences?.favorite_players || [];

  const addFavoritePlayer = async (playerId: string) => {
    if (!preferences || favoritePlayerIds.includes(playerId)) return;

    try {
      await updatePreferences.mutateAsync({
        favorite_players: [...favoritePlayerIds, playerId],
      });
      
      toast({
        title: 'Player Added',
        description: 'Player added to your favorites.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add player to favorites.',
        variant: 'destructive',
      });
    }
  };

  const removeFavoritePlayer = async (playerId: string) => {
    if (!preferences) return;

    try {
      await updatePreferences.mutateAsync({
        favorite_players: favoritePlayerIds.filter(id => id !== playerId),
      });
      
      toast({
        title: 'Player Removed',
        description: 'Player removed from your favorites.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove player from favorites.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Favorite Players
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Favorites */}
        <div>
          <h4 className="text-sm font-medium mb-2">Current Favorites</h4>
          {favoritePlayerIds.length === 0 ? (
            <p className="text-sm text-muted-foreground">No favorite players yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {favoritePlayerIds.map((playerId) => (
                <Badge key={playerId} variant="secondary" className="flex items-center gap-1">
                  {playerId}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => removeFavoritePlayer(playerId)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Add New Favorites */}
        <div>
          <h4 className="text-sm font-medium mb-2">Add Players</h4>
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {searchTerm && (
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                {availablePlayers.slice(0, 10).map((playerName) => (
                  <div key={playerName} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                    <span className="text-sm">{playerName}</span>
                    {!favoritePlayerIds.includes(playerName) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addFavoritePlayer(playerName)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
