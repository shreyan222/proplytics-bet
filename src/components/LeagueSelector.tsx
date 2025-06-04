import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
interface LeagueSelectorProps {
  selectedLeague: 'NBA' | 'NFL' | 'MLB';
  onLeagueChange: (league: 'NBA' | 'NFL' | 'MLB') => void;
  className?: string;
}
export const LeagueSelector: React.FC<LeagueSelectorProps> = ({
  selectedLeague,
  onLeagueChange,
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
  }, {
    id: 'MLB' as const,
    name: 'MLB',
    color: 'bg-purple-600 hover:bg-purple-700'
  }];
  return <Card className={`glass-card border border-slate-700 ${className}`}>
      <CardContent className="p-4 mx-[240px] px-[240px]">
        <div className="flex items-center justify-center gap-2">
          <span className="text-white font-medium mr-4">League:</span>
          {leagues.map(league => <Button key={league.id} onClick={() => onLeagueChange(league.id)} variant={selectedLeague === league.id ? 'default' : 'outline'} className={selectedLeague === league.id ? `${league.color} text-white font-bold border-2 border-white/20` : 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'} size="lg">
              {league.name}
            </Button>)}
        </div>
      </CardContent>
    </Card>;
};