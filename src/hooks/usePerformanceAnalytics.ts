
import { useMemo } from 'react';
import { Prop } from '@/types/nba';

interface PerformanceMetrics {
  totalProps: number;
  categoryBreakdown: {
    standard: number;
    demon: number;
    goblin: number;
  };
  averageScores: {
    h2h: number;
    l5: number;
    sorting: number;
  };
  topPerformers: Prop[];
  statTypeDistribution: Record<string, number>;
  teamDistribution: Record<string, number>;
  positionDistribution: Record<string, number>;
  scoreDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  sampleSizeAnalysis: {
    average: number;
    median: number;
    min: number;
    max: number;
  };
}

export const usePerformanceAnalytics = (props: Prop[]): PerformanceMetrics => {
  return useMemo(() => {
    if (!props || props.length === 0) {
      return {
        totalProps: 0,
        categoryBreakdown: { standard: 0, demon: 0, goblin: 0 },
        averageScores: { h2h: 0, l5: 0, sorting: 0 },
        topPerformers: [],
        statTypeDistribution: {},
        teamDistribution: {},
        positionDistribution: {},
        scoreDistribution: [],
        sampleSizeAnalysis: { average: 0, median: 0, min: 0, max: 0 },
      };
    }

    // Category breakdown
    const categoryBreakdown = props.reduce((acc, prop) => {
      acc[prop.odds_type]++;
      return acc;
    }, { standard: 0, demon: 0, goblin: 0 });

    // Average scores
    const averageScores = {
      h2h: props.reduce((sum, prop) => sum + prop.h2h_score, 0) / props.length,
      l5: props.reduce((sum, prop) => sum + prop.l5_score, 0) / props.length,
      sorting: props.reduce((sum, prop) => sum + prop.sorting_score, 0) / props.length,
    };

    // Top performers (top 10 by sorting score)
    const topPerformers = [...props]
      .sort((a, b) => b.sorting_score - a.sorting_score)
      .slice(0, 10);

    // Distribution analysis
    const statTypeDistribution = props.reduce((acc, prop) => {
      acc[prop.stat_type] = (acc[prop.stat_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const teamDistribution = props.reduce((acc, prop) => {
      acc[prop.team] = (acc[prop.team] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const positionDistribution = props.reduce((acc, prop) => {
      acc[prop.position] = (acc[prop.position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Score distribution (binned)
    const scoreRanges = [
      { min: 0, max: 0.5, label: '0.0 - 0.5' },
      { min: 0.5, max: 0.75, label: '0.5 - 0.75' },
      { min: 0.75, max: 0.875, label: '0.75 - 0.875' },
      { min: 0.875, max: 1.0, label: '0.875 - 1.0' },
      { min: 1.0, max: Infinity, label: '1.0+' },
    ];

    const scoreDistribution = scoreRanges.map(range => {
      const count = props.filter(prop => 
        prop.sorting_score >= range.min && prop.sorting_score < range.max
      ).length;
      return {
        range: range.label,
        count,
        percentage: (count / props.length) * 100,
      };
    });

    // Sample size analysis
    const sampleSizes = props.map(prop => prop.sample_size).sort((a, b) => a - b);
    const sampleSizeAnalysis = {
      average: sampleSizes.reduce((sum, size) => sum + size, 0) / sampleSizes.length,
      median: sampleSizes[Math.floor(sampleSizes.length / 2)],
      min: sampleSizes[0],
      max: sampleSizes[sampleSizes.length - 1],
    };

    return {
      totalProps: props.length,
      categoryBreakdown,
      averageScores,
      topPerformers,
      statTypeDistribution,
      teamDistribution,
      positionDistribution,
      scoreDistribution,
      sampleSizeAnalysis,
    };
  }, [props]);
};
