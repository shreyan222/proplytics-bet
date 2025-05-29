
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface PerformanceData {
  date: string;
  score: number;
  result: 'hit' | 'miss';
  statType: string;
  line: number;
  actual: number;
}

interface PlayerPerformanceChartProps {
  data: PerformanceData[];
  title: string;
  type: 'line' | 'bar';
}

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
  hit: {
    label: "Hit",
    color: "hsl(120, 70%, 50%)",
  },
  miss: {
    label: "Miss", 
    color: "hsl(0, 70%, 50%)",
  },
};

export const PlayerPerformanceChart: React.FC<PlayerPerformanceChartProps> = ({
  data,
  title,
  type = 'line',
}) => {
  const processedData = data.map((item, index) => ({
    ...item,
    gameNumber: index + 1,
    resultColor: item.result === 'hit' ? '#22c55e' : '#ef4444',
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'line' ? (
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="gameNumber" 
                  label={{ value: 'Game #', position: 'insideBottom', offset: -5 }}
                />
                <YAxis label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    typeof value === 'number' ? value.toFixed(2) : value,
                    name
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="var(--color-score)" 
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-score)', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            ) : (
              <BarChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="gameNumber"
                  label={{ value: 'Game #', position: 'insideBottom', offset: -5 }}
                />
                <YAxis label={{ value: 'Actual vs Line', angle: -90, position: 'insideLeft' }} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    typeof value === 'number' ? value.toFixed(1) : value,
                    name
                  ]}
                />
                <Bar 
                  dataKey="actual" 
                  fill={(entry: any) => entry.resultColor}
                  name="Actual Performance"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
