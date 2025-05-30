import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Target, Award } from 'lucide-react';
import { Prop } from '@/types/nba';

interface StatsGridProps {
  props: Prop[];
  isLoading: boolean;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ props, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Loading data...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalProps = props.length;
  const goblinProps = props.filter(p => p.odds_type === 'goblin').length;
  const demonProps = props.filter(p => p.odds_type === 'demon').length;
  const avgScore = props.length > 0 
    ? props.reduce((sum, p) => sum + p.sorting_score, 0) / props.length 
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Props</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProps}</div>
          <p className="text-xs text-muted-foreground">
            Active propositions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Goblin Props</CardTitle>
          <Award className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{goblinProps}</div>
          <p className="text-xs text-muted-foreground">
            High confidence picks
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Demon Props</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{demonProps}</div>
          <p className="text-xs text-muted-foreground">
            Medium confidence picks
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Avg Score</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground/70" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{avgScore.toFixed(3)}</div>
          <p className="text-xs text-muted-foreground/80">
            Overall confidence
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
