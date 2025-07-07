
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LeagueSelectorProps {
  selectedLeagues: ('NBA' | 'NFL')[];
  onLeaguesChange: (leagues: ('NBA' | 'NFL')[]) => void;
  className?: string;
}

export const LeagueSelector: React.FC<LeagueSelectorProps> = ({
  selectedLeagues,
  onLeaguesChange,
  className = ''
}) => {
  const leagues = [{
    id: 'NBA' as const,
    name: 'NBA',
    color: 'bg-blue-600 hover:bg-blue-700'
  }, {
    id: 'NFL' as const,
    name: 'NFL',
    color: 'bg-green-600 hover:bg-green-700'
  }];

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
