
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LeagueSelectorProps {
  selectedLeagues: ('NBA' | 'NFL')[];
  onLeaguesChange: (leagues: ('NBA' | 'NFL')[]) => void;
  className?: string;
}

const STORAGE_KEY = 'prop-picks-selected-leagues';

export const LeagueSelector: React.FC<LeagueSelectorProps> = ({
  selectedLeagues,
  onLeaguesChange,
  className = ''
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const leagues = [{
    id: 'NBA' as const,
    name: 'NBA',
    color: 'bg-blue-600 hover:bg-blue-700'
  }, {
    id: 'NFL' as const,
    name: 'NFL',
    color: 'bg-green-600 hover:bg-green-700'
  }];

  // Initialize leagues from localStorage or default to NBA only
  useEffect(() => {
    if (!isInitialized) {
      const savedLeagues = localStorage.getItem(STORAGE_KEY);
      
      if (savedLeagues) {
        try {
          const parsedLeagues = JSON.parse(savedLeagues);
          if (Array.isArray(parsedLeagues) && parsedLeagues.length > 0) {
            onLeaguesChange(parsedLeagues);
          } else {
            // Fallback to default NBA only if saved data is invalid
            onLeaguesChange(['NBA']);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(['NBA']));
          }
        } catch (error) {
          // Fallback to default NBA only if parsing fails
          onLeaguesChange(['NBA']);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(['NBA']));
        }
      } else {
        // First time visit - default to NBA only
        onLeaguesChange(['NBA']);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(['NBA']));
      }
      
      setIsInitialized(true);
    }
  }, [isInitialized, onLeaguesChange]);

  // Save to localStorage whenever selection changes
  useEffect(() => {
    if (isInitialized && selectedLeagues.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedLeagues));
    }
  }, [selectedLeagues, isInitialized]);

  const toggleLeague = (league: 'NBA' | 'NFL') => {
    if (selectedLeagues.includes(league)) {
      // Remove league if it's selected and there's more than one selected
      if (selectedLeagues.length > 1) {
        onLeaguesChange(selectedLeagues.filter(l => l !== league));
      }
    } else {
      // Add league to selection
      onLeaguesChange([...selectedLeagues, league]);
    }
  };

  return (
    <Card className={`glass-card border border-slate-700 ${className}`}>
      <CardContent className="p-4 mx-[240px] px-[240px]">
        <div className="flex items-center justify-center gap-2">
          <span className="text-white font-medium mr-4">Leagues:</span>
          {leagues.map(league => (
            <Button
              key={league.id}
              onClick={() => toggleLeague(league.id)}
              variant={selectedLeagues.includes(league.id) ? 'default' : 'outline'}
              className={selectedLeagues.includes(league.id) 
                ? `${league.color} text-white font-bold border-2 border-white/20` 
                : 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'
              }
              size="lg"
            >
              {league.name}
            </Button>
          ))}
          <span className="text-sm text-slate-400 ml-2">
            ({selectedLeagues.length} selected)
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
