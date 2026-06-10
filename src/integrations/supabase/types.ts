export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_key: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_key: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_key?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      assessments: {
        Row: {
          answers: Json
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          followed_id: string
          follower_id: string
        }
        Insert: {
          created_at?: string
          followed_id: string
          follower_id: string
        }
        Update: {
          created_at?: string
          followed_id?: string
          follower_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_followed_id_fkey"
            columns: ["followed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          profile_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          profile_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          allow_search: boolean
          avatar_url: string | null
          bio: string | null
          consent_version: string | null
          consented_at: string | null
          country: string | null
          created_at: string
          display_name: string | null
          followers_count: number
          following_count: number
          id: string
          likes_count: number
          profile_visibility: string
          referred_by: string | null
          result_visibility: string
          show_on_leaderboard: boolean
          tier: Database["public"]["Enums"]["tier"]
          updated_at: string
          username: string
        }
        Insert: {
          allow_search?: boolean
          avatar_url?: string | null
          bio?: string | null
          consent_version?: string | null
          consented_at?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          followers_count?: number
          following_count?: number
          id: string
          likes_count?: number
          profile_visibility?: string
          referred_by?: string | null
          result_visibility?: string
          show_on_leaderboard?: boolean
          tier?: Database["public"]["Enums"]["tier"]
          updated_at?: string
          username: string
        }
        Update: {
          allow_search?: boolean
          avatar_url?: string | null
          bio?: string | null
          consent_version?: string | null
          consented_at?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          followers_count?: number
          following_count?: number
          id?: string
          likes_count?: number
          profile_visibility?: string
          referred_by?: string | null
          result_visibility?: string
          show_on_leaderboard?: boolean
          tier?: Database["public"]["Enums"]["tier"]
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          status: string
          stripe_session_id: string | null
          tier: Database["public"]["Enums"]["tier"]
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          status?: string
          stripe_session_id?: string | null
          tier: Database["public"]["Enums"]["tier"]
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          status?: string
          stripe_session_id?: string | null
          tier?: Database["public"]["Enums"]["tier"]
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_user_id: string
          referrer_id: string
          status: Database["public"]["Enums"]["referral_status"]
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          referred_user_id: string
          referrer_id: string
          status?: Database["public"]["Enums"]["referral_status"]
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          referred_user_id?: string
          referrer_id?: string
          status?: Database["public"]["Enums"]["referral_status"]
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          archetype_key: string
          assessment_id: string
          confidence: number
          created_at: string
          id: string
          model_version: string
          one_in_x: number
          percentile: number
          traits: Json
          user_id: string
        }
        Insert: {
          archetype_key: string
          assessment_id: string
          confidence?: number
          created_at?: string
          id?: string
          model_version: string
          one_in_x: number
          percentile: number
          traits: Json
          user_id: string
        }
        Update: {
          archetype_key?: string
          assessment_id?: string
          confidence?: number
          created_at?: string
          id?: string
          model_version?: string
          one_in_x?: number
          percentile?: number
          traits?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          consumed_at: string | null
          created_at: string
          id: string
          source: Database["public"]["Enums"]["reward_source"]
          tier: Database["public"]["Enums"]["tier"]
          user_id: string
        }
        Insert: {
          consumed_at?: string | null
          created_at?: string
          id?: string
          source: Database["public"]["Enums"]["reward_source"]
          tier: Database["public"]["Enums"]["tier"]
          user_id: string
        }
        Update: {
          consumed_at?: string | null
          created_at?: string
          id?: string
          source?: Database["public"]["Enums"]["reward_source"]
          tier?: Database["public"]["Enums"]["tier"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      referral_status: "pending" | "verified" | "rewarded"
      reward_source: "referral_3" | "referral_5" | "referral_10" | "admin_grant"
      tier: "free" | "premium" | "pro" | "ultimate"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      referral_status: ["pending", "verified", "rewarded"],
      reward_source: ["referral_3", "referral_5", "referral_10", "admin_grant"],
      tier: ["free", "premium", "pro", "ultimate"],
    },
  },
} as const
