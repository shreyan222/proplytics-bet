
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine } from 'recharts';
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
  // New props for enhanced bar charts
  lineScore?: number;
  statType?: string;
  chartType?: 'line' | 'bar';
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
  lineScore,
  statType,
  chartType,
}) => {
  const processedData = data.map((item, index) => ({
    ...item,
    gameNumber: index + 1,
    resultColor: item.result === 'hit' ? '#22c55e' : '#ef4444',
  }));

  // Enhanced bar chart with performance data
  if (chartType === 'bar' && lineScore !== undefined && statType) {
    const chartData = data.map((item, idx) => ({
      game: `G${idx + 1}`,
      performance: item.actual,
      color: item.actual >= lineScore ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)',
      borderColor: item.actual >= lineScore ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
    }));

    // Calculate y-axis domain with padding
    const minVal = chartData.length ? Math.min(...chartData.map(d => d.performance)) : 0;
    const maxVal = chartData.length ? Math.max(...chartData.map(d => d.performance)) : 1;
    const yMin = Math.min(minVal, lineScore) - Math.max(1, (maxVal - minVal) * 0.1);
    const yMax = Math.max(maxVal, lineScore) + Math.max(1, (maxVal - minVal) * 0.1);

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 overflow-x-auto bg-gradient-to-br from-slate-900/20 to-slate-800/10 rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={400}>
              <BarChart 
                data={chartData} 
                margin={{ top: 20, right: 60, left: 20, bottom: 5 }}
                barCategoryGap="15%"
                barGap="8%"
                maxBarSize={80}
                layout="vertical"
              >
                <defs>
                  <linearGradient id="barGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(34,197,94,0.95)" />
                    <stop offset="50%" stopColor="rgba(34,197,94,0.8)" />
                    <stop offset="100%" stopColor="rgba(34,197,94,0.6)" />
                  </linearGradient>
                  <linearGradient id="barRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(239,68,68,0.95)" />
                    <stop offset="50%" stopColor="rgba(239,68,68,0.8)" />
                    <stop offset="100%" stopColor="rgba(239,68,68,0.6)" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <pattern id="gridPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(71, 85, 105, 0.05)" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(71, 85, 105, 0.2)" 
                  strokeOpacity={0.15}
                  horizontal={false}
                  vertical={true}
                />
                <rect x="0" y="0" width="100%" height="100%" fill="url(#gridPattern)" opacity="0.3" />
                <XAxis 
                  dataKey="game" 
                  stroke="rgb(148, 163, 184)"
                  fontSize={12}
                  tick={{ fontSize: 10 }}
                  type="category"
                />
                <YAxis 
                  stroke="rgb(148, 163, 184)"
                  fontSize={12}
                  domain={[yMin, yMax]}
                  tickFormatter={(value) => value.toFixed(1)}
                  type="number"
                  label={{ 
                    value: `${statType}`, 
                    angle: 0, 
                    position: 'insideBottom',
                    style: { textAnchor: 'middle', fill: 'rgb(148, 163, 184)' }
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    borderRadius: '12px',
                    color: 'white',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(10px)',
                    padding: '12px 16px'
                  }}
                  labelStyle={{ color: 'rgb(148, 163, 184)', fontWeight: 'bold', fontSize: '14px' }}
                  formatter={(value, name) => [`${value} ${statType}`, 'Performance']}
                  labelFormatter={(label) => `Game ${label}`}
                  cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                  animationDuration={200}
                  isAnimationActive={true}
                />
                <ReferenceLine 
                  y={lineScore} 
                  stroke="rgb(74, 222, 128)" 
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  label={{ 
                    value: `Line: ${lineScore}`, 
                    position: 'insideTop',
                    fill: 'rgb(74, 222, 128)',
                    fontSize: 11,
                    fontWeight: 'bold',
                    offset: 10
                  }}
                />
                <Bar 
                  dataKey="performance" 
                  radius={[4, 4, 0, 0]}
                  fill="currentColor"
                  isAnimationActive={true}
                  animationDuration={800}
                  animationEasing="ease"
                  onMouseEnter={(data, index) => {
                    // Enhanced hover effect
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.performance >= lineScore ? "url(#barGreen)" : "url(#barRed)"}
                      stroke={entry.performance >= lineScore ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Original line/bar chart logic
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
                <Bar dataKey="actual" name="Actual Performance">
                  {processedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.resultColor} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
