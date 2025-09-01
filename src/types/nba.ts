
// Core data types matching your Python structures
export interface Player {
  id: string;
  display_name: string;
  position: string;
  team: string;
  image_url?: string;
}

// New normalized prop schema for search and display
export interface NormalizedProp {
  id: string;
  player: string;
  prop_type: string;
  odd_type: 'Standard' | 'Alt Lines' | 'Goblin' | 'Demon';
  line: number;
  odds: number;
  // Additional fields for enhanced functionality
  team?: string;
  opponent?: string;
  position?: string;
  start_time?: string;
  league?: string;
  // Performance metrics
  h2h_avg?: number;
  l5_avg?: number;
  sorting_score?: number;
  sample_size?: number;
}

// Legacy prop interface (keeping for backward compatibility)
export interface Prop {
  prop_id: string;
  player_id: string;
  player_name: string;
  position: string;
  team: string;
  against_team: string;
  stat_type: string;
  line_score: number;
  odds_type: 'standard' | 'demon' | 'goblin';
  game_id: string;
  start_time: string;
  h2h_array: number[];
  l5_array: number[];
  h2h_avg: number;
  l5_avg: number;
  h2h_score: number;
  l5_score: number;
  sample_size: number;
  sorting_score: number;
  // Add the computed fields from your database
  sorting_score_computed?: number;
  h2h_score_computed?: number;
  l5_score_computed?: number;
  h2h_relative_diff_computed?: number;
  l5_relative_diff_computed?: number;
  h2h_percent_computed?: number;
  l5_percent_computed?: number;
  matchup_rank?: number | null;
  league?: string;
}

// Grouped props for display
export interface GroupedProps {
  player: string;
  prop_types: {
    [propType: string]: {
      [oddType: string]: NormalizedProp[];
    };
  };
  total_props: number;
}

// Search filters
export interface SearchFilters {
  prop_type?: string[];
  odd_type?: string[];
  min_line?: number;
  max_line?: number;
  min_odds?: number;
  max_odds?: number;
  team?: string[];
  position?: string[];
  league?: string[];
}

// Search result with grouping
export interface SearchResult {
  query: string;
  total_results: number;
  grouped_props: GroupedProps[];
  filters: SearchFilters;
  suggestions: string[];
}

export interface PropAnalysis {
  prop: Prop;
  h2h_temp: number;
  h2h_size: number;
  l5_temp: number;
  h2h_diff: number;
  h2h_relative_diff: number;
  h2h_percent: number;
  l5_diff: number;
  l5_relative_diff: number;
  l5_percent: number;
}

export interface ChangeNotification {
  id: string;
  type: 'new' | 'removed' | 'changed';
  prop: Prop;
  timestamp: string;
  changes?: Record<string, { previous: any; current: any }>;
}

export interface UserPreferences {
  favorite_players: string[];
  favorite_props: string[];
  notification_settings: {
    new_props: boolean;
    removed_props: boolean;
    line_changes: boolean;
    odds_changes: boolean;
    favorite_players_only: boolean;
  };
  filter_presets: FilterPreset[];
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: PropFilters;
}

export interface PropFilters {
  teams?: string[];
  positions?: string[];
  stat_types?: string[];
  odds_types?: ('standard' | 'demon' | 'goblin')[];
  min_score?: number;
  max_score?: number;
  min_sample_size?: number;
}
