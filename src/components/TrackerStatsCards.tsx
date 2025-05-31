
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Minus, Edit, BarChart3 } from 'lucide-react';

interface TrackerStatsCardsProps {
  data: any;
}

export const TrackerStatsCards: React.FC<TrackerStatsCardsProps> = ({ data }) => {
  const stats = [
    {
      title: 'Total Active Props',
      value: data?.total_active || 0,
      icon: BarChart3,
      color: 'border-l-blue-500',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600',
    },
    {
      title: 'New Props',
      value: data?.new_props?.length || 0,
      icon: Plus,
      color: 'border-l-green-500',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-600',
      pulse: data?.new_props?.length > 0,
    },
    {
      title: 'Removed Props',
      value: data?.removed_props?.length || 0,
      icon: Minus,
      color: 'border-l-red-500',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-600',
      pulse: data?.removed_props?.length > 0,
    },
    {
      title: 'Modified Props',
      value: data?.changed_props?.length || 0,
      icon: Edit,
      color: 'border-l-orange-500',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-600',
      pulse: data?.changed_props?.length > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className={`border-l-4 ${stat.color} ${stat.pulse ? 'animate-pulse' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
