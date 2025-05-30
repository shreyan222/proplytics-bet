
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validatePropData = (prop: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!prop.player_name || prop.player_name.trim() === '') {
    errors.push('Player name is required');
  }

  if (!prop.stat_type || prop.stat_type.trim() === '') {
    errors.push('Stat type is required');
  }

  if (prop.line_score === undefined || prop.line_score === null) {
    errors.push('Line score is required');
  } else if (typeof prop.line_score !== 'number' || prop.line_score < 0) {
    errors.push('Line score must be a positive number');
  }

  if (!['standard', 'demon', 'goblin'].includes(prop.odds_type)) {
    errors.push('Odds type must be standard, demon, or goblin');
  }

  // Array validation
  if (!Array.isArray(prop.h2h_array)) {
    errors.push('H2H array must be an array');
  } else if (prop.h2h_array.some((val: any) => typeof val !== 'number')) {
    errors.push('H2H array must contain only numbers');
  }

  if (!Array.isArray(prop.l5_array)) {
    errors.push('L5 array must be an array');
  } else if (prop.l5_array.some((val: any) => typeof val !== 'number')) {
    errors.push('L5 array must contain only numbers');
  }

  // Score validation
  if (typeof prop.sorting_score !== 'number' || prop.sorting_score < 0 || prop.sorting_score > 2) {
    warnings.push('Sorting score should be between 0 and 2');
  }

  if (typeof prop.sample_size !== 'number' || prop.sample_size < 1) {
    warnings.push('Sample size should be at least 1');
  }

  // Team validation
  if (!prop.team || prop.team.length !== 3) {
    warnings.push('Team should be a 3-letter abbreviation');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validatePlayerData = (player: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!player.display_name || player.display_name.trim() === '') {
    errors.push('Player display name is required');
  }

  if (!player.position || !['PG', 'SG', 'SF', 'PF', 'C'].includes(player.position)) {
    warnings.push('Position should be one of: PG, SG, SF, PF, C');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateStatMuseResponse = (data: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(data.stats)) {
    errors.push('Stats must be an array');
  }

  if (data.stats && data.stats.some((stat: any) => typeof stat !== 'number')) {
    warnings.push('Some stats are not numbers');
  }

  if (!data.player_name) {
    errors.push('Player name is required in response');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
