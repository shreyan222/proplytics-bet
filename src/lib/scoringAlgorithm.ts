
// NBA Props scoring algorithm - migrated from Python logic
import { Prop, PropAnalysis } from '@/types/nba';

export class ScoringAlgorithm {
  static calculatePropScore(
    name: string,
    statType: string,
    line: number,
    oddsType: 'standard' | 'demon' | 'goblin',
    h2hArray: number[],
    l5Array: number[]
  ): PropAnalysis | null {
    
    const h2hSize = h2hArray.length;
    if (h2hSize === 0) return null;

    // Calculate H2H temp score
    let h2hTemp = 0;
    let h2hInjury = 0;
    
    for (let j = 0; j < h2hSize; j++) {
      if (h2hArray[j] >= line) {
        h2hTemp += 1;
      } else if (h2hInjury < 1) {
        // In Python you check for minutes < 20 for injury detection
        // For now we'll implement basic injury detection based on very low scores
        if (h2hArray[j] < (line * 0.3)) {
          h2hInjury += 0.5; // Partial credit for potential injury games
        }
      } else if (!['Blks+Stls', 'Steals', 'Blocked Shots', 'Turnovers'].includes(statType)) {
        // Give partial credit for close misses (within 1 of the line)
        if (h2hArray[j] + 1 >= line) {
          h2hTemp += 0.5;
        }
      }
    }
    
    h2hTemp = h2hTemp + h2hInjury;
    const h2hScore = h2hTemp / h2hSize;
    
    // Determine threshold based on odds type - exact from Python
    const threshold = oddsType === 'goblin' ? 0.875 : 0.75;
    const h2hAvg = h2hArray.reduce((sum, val) => sum + val, 0) / h2hArray.length;
    
    // Check if prop meets threshold criteria - exact from Python
    if (h2hScore < threshold || (h2hAvg - line) < 0) {
      return null;
    }
    
    // Calculate L5 score
    const l5Size = l5Array.length;
    let l5Temp = 0;
    
    for (let j = 0; j < l5Size; j++) {
      if (l5Array[j] >= line) {
        l5Temp += 1;
      } else if (!['Blks+Stls', 'Steals', 'Blocked Shots', 'Turnovers'].includes(statType)) {
        if (l5Array[j] + 1 >= line) {
          l5Temp += 0.5;
        }
      }
    }
    
    const l5Score = l5Size > 0 ? l5Temp / l5Size : 0;
    const l5Avg = l5Array.length > 0 ? l5Array.reduce((sum, val) => sum + val, 0) / l5Array.length : 0;
    
    // Calculate differences and percentages - exact formulas from Python
    const h2hDiff = h2hAvg - line;
    const h2hRelativeDiff = (h2hAvg - line) / (line + 5);
    const h2hPercent = 100 * (h2hAvg - line) / line;
    
    const l5Diff = l5Avg - line;
    const l5RelativeDiff = (l5Avg - line) / (line + 5);
    const l5Percent = 100 * (l5Avg - line) / line;
    
    // Calculate final sorting score using your exact formula:
    // H2H 45%, relative diff 20%, sample size 20%, L5 10%, L5 relative diff 5%
    const sortingScore = (
      (h2hTemp / h2hSize) * 0.45 +
      (h2hRelativeDiff * 0.20) +
      (h2hSize * 0.20) +
      (l5Temp / Math.max(l5Size, 1)) * 0.1 +
      (l5RelativeDiff * 0.05)
    );
    
    const prop: Prop = {
      prop_id: '',
      player_id: '',
      player_name: name,
      position: '',
      team: '',
      against_team: '',
      stat_type: statType,
      line_score: line,
      odds_type: oddsType,
      game_id: '',
      start_time: '',
      h2h_array: h2hArray,
      l5_array: l5Array,
      h2h_avg: h2hAvg,
      l5_avg: l5Avg,
      h2h_score: h2hScore,
      l5_score: l5Score,
      sample_size: h2hSize,
      sorting_score: Math.round(sortingScore * 1000) / 1000,
    };
    
    return {
      prop,
      h2h_temp: h2hTemp,
      h2h_size: h2hSize,
      l5_temp: l5Temp,
      h2h_diff: Math.round(h2hDiff * 1000) / 1000,
      h2h_relative_diff: Math.round(h2hRelativeDiff * 1000) / 1000,
      h2h_percent: Math.round(h2hPercent * 1000) / 1000,
      l5_diff: Math.round(l5Diff * 1000) / 1000,
      l5_relative_diff: Math.round(l5RelativeDiff * 1000) / 1000,
      l5_percent: Math.round(l5Percent * 1000) / 1000,
    };
  }

  // Helper function to categorize props based on scoring thresholds
  static categorizeProp(h2hScore: number, h2hAvg: number, line: number): 'standard' | 'demon' | 'goblin' | null {
    // First check if prop meets minimum criteria
    if ((h2hAvg - line) < 0) return null;
    
    if (h2hScore >= 0.875) {
      return 'goblin';
    } else if (h2hScore >= 0.75) {
      return 'demon';
    } else if (h2hScore >= 0.75) {
      return 'standard';
    }
    
    return null;
  }

  // Process all supported stat types
  static getSupportedStatTypes(): string[] {
    return [
      'Points',
      'Rebounds', 
      'Assists',
      'Pts+Rebs',
      'Pts+Asts',
      'Rebs+Asts',
      'Pts+Rebs+Asts',
      'Steals',
      'Blocked Shots',
      'Turnovers',
      'Blks+Stls',
      '3-PT Made',
      'Fantasy Points'
    ];
  }
}
