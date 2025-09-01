
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
  playerId: string;
  playerName: string;
  position: string;
  team: string;
  totalProps: number;
  demonProps: number;
  goblinProps: number;
  standardProps: number;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  playerId,
  playerName,
  position,
  team,
  totalProps,
  demonProps,
  goblinProps,
  standardProps,
}) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 glass-card border border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="text-white">{playerName}</span>
          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
            <User className="h-4 w-4 text-blue-400" />
          </div>
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-slate-700 text-slate-300 border-slate-600">
            {position}
          </Badge>
          <Badge variant="outline" className="border-slate-600 text-slate-300">
            {team}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Basic Stats */}
        <div className="text-center p-3 border border-slate-700 rounded-lg bg-slate-800/50 mb-4">
          <p className="text-slate-400 text-xs mb-1">Total Props</p>
          <p className="font-semibold text-white text-lg">{totalProps}</p>
        </div>

        {/* Prop Type Counts */}
        <div className="space-y-3 mb-4">
          <div className="text-sm text-slate-400 mb-2">Prop Distribution:</div>
          
          {/* Demon Props */}
          <div className={cn(
            "flex items-center justify-between p-2 rounded-lg border",
            demonProps > 0 
              ? "bg-red-500/10 border-red-500/30" 
              : "bg-slate-800/30 border-slate-700"
          )}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-slate-300">Demon</span>
            </div>
            <span className={cn(
              "font-semibold",
              demonProps > 0 ? "text-red-400" : "text-slate-500"
            )}>
              {demonProps}
            </span>
          </div>

          {/* Goblin Props */}
          <div className={cn(
            "flex items-center justify-between p-2 rounded-lg border",
            goblinProps > 0 
              ? "bg-green-500/10 border-green-500/30" 
              : "bg-slate-800/30 border-slate-700"
          )}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-300">Goblin</span>
            </div>
            <span className={cn(
              "font-semibold",
              goblinProps > 0 ? "text-green-400" : "text-slate-500"
            )}>
              {goblinProps}
            </span>
          </div>

          {/* Standard Props */}
          <div className={cn(
            "flex items-center justify-between p-2 rounded-lg border",
            standardProps > 0 
              ? "bg-blue-500/10 border-blue-500/30" 
              : "bg-slate-800/30 border-slate-700"
          )}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-slate-300">Standard</span>
            </div>
            <span className={cn(
              "font-semibold",
              standardProps > 0 ? "text-blue-400" : "text-slate-500"
            )}>
              {standardProps}
            </span>
          </div>
        </div>

        {/* Click Indicator */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700">
            <Target className="h-3 w-3" />
            Click to view all props
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
