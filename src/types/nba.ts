
// Core data types matching your Python structures
export interface Player {
  id: string;
  display_name: string;
  position: string;
  team: string;
  image_url?: string;
}

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
