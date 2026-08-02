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
      admin_config: {
        Row: {
          key: string
          value: string | null
        }
        Insert: {
          key: string
          value?: string | null
        }
        Update: {
          key?: string
          value?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          id: string
          issued_at: string
          niche_id: string
          pdf_storage_path: string | null
          user_id: string
        }
        Insert: {
          id?: string
          issued_at?: string
          niche_id: string
          pdf_storage_path?: string | null
          user_id: string
        }
        Update: {
          id?: string
          issued_at?: string
          niche_id?: string
          pdf_storage_path?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_niche_id_fkey"
            columns: ["niche_id"]
            isOneToOne: false
            referencedRelation: "niches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_faq: {
        Row: {
          answer: string
          id: string
          keywords: string | null
          question: string
        }
        Insert: {
          answer: string
          id?: string
          keywords?: string | null
          question: string
        }
        Update: {
          answer?: string
          id?: string
          keywords?: string | null
          question?: string
        }
        Relationships: []
      }
      chatbot_unmatched: {
        Row: {
          created_at: string
          id: string
          question: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          question: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          question?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_unmatched_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          legacy_id: string | null
          niche_id: string
          sort_order: number
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          legacy_id?: string | null
          niche_id: string
          sort_order?: number
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          legacy_id?: string | null
          niche_id?: string
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_niche_id_fkey"
            columns: ["niche_id"]
            isOneToOne: false
            referencedRelation: "niches"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content_html: string | null
          content_storage_path: string | null
          created_at: string
          id: string
          legacy_id: string | null
          module_id: string
          sort_order: number
          thumbnail_storage_path: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          content_html?: string | null
          content_storage_path?: string | null
          created_at?: string
          id?: string
          legacy_id?: string | null
          module_id: string
          sort_order?: number
          thumbnail_storage_path?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          content_html?: string | null
          content_storage_path?: string | null
          created_at?: string
          id?: string
          legacy_id?: string | null
          module_id?: string
          sort_order?: number
          thumbnail_storage_path?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      live_support_messages: {
        Row: {
          body: string
          id: string
          sender: string
          sent_at: string
          session_id: string
        }
        Insert: {
          body: string
          id?: string
          sender: string
          sent_at?: string
          session_id: string
        }
        Update: {
          body?: string
          id?: string
          sender?: string
          sent_at?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_support_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_support_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_support_sessions: {
        Row: {
          accepted_at: string | null
          closed_at: string | null
          created_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          closed_at?: string | null
          created_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          closed_at?: string | null
          created_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_support_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          admin_reply: string | null
          body: string
          id: string
          replied_at: string | null
          sent_at: string
          subject: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          body: string
          id?: string
          replied_at?: string | null
          sent_at?: string
          subject: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          body?: string
          id?: string
          replied_at?: string | null
          sent_at?: string
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          id: string
          legacy_id: string | null
          sort_order: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          legacy_id?: string | null
          sort_order?: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          legacy_id?: string | null
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      niches: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          legacy_id: string | null
          sort_order: number
          title: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          legacy_id?: string | null
          sort_order?: number
          title: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          legacy_id?: string | null
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          amount_paid: number | null
          created_at: string
          email: string
          enrolled_niche_id: string | null
          id: string
          is_admin: boolean
          name: string
          payment_method: string | null
          payment_submitted_at: string | null
          profile_photo_url: string | null
          reference_number: string | null
          signup_date: string
          tnc_accepted_at: string | null
          verified: boolean
          verified_date: string | null
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          email: string
          enrolled_niche_id?: string | null
          id: string
          is_admin?: boolean
          name: string
          payment_method?: string | null
          payment_submitted_at?: string | null
          profile_photo_url?: string | null
          reference_number?: string | null
          signup_date?: string
          tnc_accepted_at?: string | null
          verified?: boolean
          verified_date?: string | null
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          email?: string
          enrolled_niche_id?: string | null
          id?: string
          is_admin?: boolean
          name?: string
          payment_method?: string | null
          payment_submitted_at?: string | null
          profile_photo_url?: string | null
          reference_number?: string | null
          signup_date?: string
          tnc_accepted_at?: string | null
          verified?: boolean
          verified_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_enrolled_niche_fk"
            columns: ["enrolled_niche_id"]
            isOneToOne: false
            referencedRelation: "niches"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          attempt_number: number
          id: string
          lesson_id: string
          passed: boolean
          score: number
          taken_at: string
          total_points: number
          user_id: string
        }
        Insert: {
          attempt_number?: number
          id?: string
          lesson_id: string
          passed: boolean
          score: number
          taken_at?: string
          total_points: number
          user_id: string
        }
        Update: {
          attempt_number?: number
          id?: string
          lesson_id?: string
          passed?: boolean
          score?: number
          taken_at?: string
          total_points?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          correct_answer: string
          created_at: string
          id: string
          legacy_id: string | null
          lesson_id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          points: number
          question: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          id?: string
          legacy_id?: string | null
          lesson_id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          points?: number
          question: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          id?: string
          legacy_id?: string | null
          lesson_id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          points?: number
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      stat_history: {
        Row: {
          snapshot_date: string
          total_revenue: number
          total_signups: number
          verified_students: number
        }
        Insert: {
          snapshot_date: string
          total_revenue?: number
          total_signups?: number
          verified_students?: number
        }
        Update: {
          snapshot_date?: string
          total_revenue?: number
          total_signups?: number
          verified_students?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
