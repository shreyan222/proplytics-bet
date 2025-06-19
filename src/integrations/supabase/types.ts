export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      change_notifications: {
        Row: {
          change_type: string
          changes: Json | null
          created_at: string | null
          id: string
          previous_data: Json | null
          prop_data: Json | null
          prop_id: string | null
          user_id: string | null
        }
        Insert: {
          change_type: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          previous_data?: Json | null
          prop_data?: Json | null
          prop_id?: string | null
          user_id?: string | null
        }
        Update: {
          change_type?: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          previous_data?: Json | null
          prop_data?: Json | null
          prop_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "change_notifications_prop_id_fkey"
            columns: ["prop_id"]
            isOneToOne: false
            referencedRelation: "props"
            referencedColumns: ["id"]
          },
        ]
      }
      data_ingestion_jobs: {
        Row: {
          created_at: string | null
          id: string
          job_type: string
          metadata: Json | null
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_type: string
          metadata?: Json | null
          status: string
        }
        Update: {
          created_at?: string | null
          id?: string
          job_type?: string
          metadata?: Json | null
          status?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          away_team_id: string
          created_at: string | null
          external_id: string | null
          home_team_id: string
          id: string
          start_time: string
          status: string | null
        }
        Insert: {
          away_team_id: string
          created_at?: string | null
          external_id?: string | null
          home_team_id: string
          id?: string
          start_time: string
          status?: string | null
        }
        Update: {
          away_team_id?: string
          created_at?: string | null
          external_id?: string | null
          home_team_id?: string
          id?: string
          start_time?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string | null
          display_name: string
          external_id: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          position: string | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          external_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          position?: string | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          external_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          position?: string | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
          username: string
          username_last_changed: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          updated_at?: string | null
          username: string
          username_last_changed?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
          username?: string
          username_last_changed?: string | null
        }
        Relationships: []
      }
      props: {
        Row: {
          created_at: string | null
          external_id: string | null
          game_id: string
          h2h_array: number[]
          h2h_avg: number
          h2h_score: number
          id: string
          l5_array: number[]
          l5_avg: number
          l5_score: number
          line_score: number
          odds_type: string
          player_id: string
          sample_size: number
          sorting_score: number
          stat_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          external_id?: string | null
          game_id: string
          h2h_array: number[]
          h2h_avg: number
          h2h_score: number
          id?: string
          l5_array: number[]
          l5_avg: number
          l5_score: number
          line_score: number
          odds_type: string
          player_id: string
          sample_size: number
          sorting_score: number
          stat_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          external_id?: string | null
          game_id?: string
          h2h_array?: number[]
          h2h_avg?: number
          h2h_score?: number
          id?: string
          l5_array?: number[]
          l5_avg?: number
          l5_score?: number
          line_score?: number
          odds_type?: string
          player_id?: string
          sample_size?: number
          sorting_score?: number
          stat_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "props_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "props_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          abbreviation: string
          city: string
          created_at: string | null
          full_name: string
          id: string
        }
        Insert: {
          abbreviation: string
          city: string
          created_at?: string | null
          full_name: string
          id?: string
        }
        Update: {
          abbreviation?: string
          city?: string
          created_at?: string | null
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          favorite_players: string[] | null
          favorite_props: string[] | null
          id: string
          notification_settings: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          favorite_players?: string[] | null
          favorite_props?: string[] | null
          id?: string
          notification_settings?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          favorite_players?: string[] | null
          favorite_props?: string[] | null
          id?: string
          notification_settings?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_change_username: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_username_available: {
        Args: { username_to_check: string }
        Returns: boolean
      }
      update_username: {
        Args: { user_id: string; new_username: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
