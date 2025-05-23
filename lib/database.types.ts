
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_analysis_results: {
        Row: {
          analysis_text: string | null
          analyzed_at: string
          good_points: string | null
          id: string
          rating: string | null
          suggestions: string | null
          user_answer_id: string
        }
        Insert: {
          analysis_text?: string | null
          analyzed_at?: string
          good_points?: string | null
          id?: string
          rating?: string | null
          suggestions?: string | null
          user_answer_id: string
        }
        Update: {
          analysis_text?: string | null
          analyzed_at?: string
          good_points?: string | null
          id?: string
          rating?: string | null
          suggestions?: string | null
          user_answer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_results_user_answer_id_fkey"
            columns: ["user_answer_id"]
            isOneToOne: true
            referencedRelation: "user_answers"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_questions: {
        Row: {
          created_at: string
          id: string
          order_index: number
          question_text: string
          question_type: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_index: number
          question_text: string
          question_type: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_index?: number
          question_text?: string
          question_type?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          completed_at: string | null
          id: string
          overall_analysis: Json | null
          started_at: string
          status: string
          topic: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          overall_analysis?: Json | null
          started_at?: string
          status?: string
          topic?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          overall_analysis?: Json | null
          started_at?: string
          status?: string
          topic?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_answers: {
        Row: {
          answer_text: string
          id: string
          metadata: Json | null
          question_id: string
          submitted_at: string
          user_id: string
        }
        Insert: {
          answer_text: string
          id?: string
          metadata?: Json | null
          question_id: string
          submitted_at?: string
          user_id: string
        }
        Update: {
          answer_text?: string
          id?: string
          metadata?: Json | null
          question_id?: string
          submitted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: true
            referencedRelation: "interview_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          areas_of_interest: string[] | null
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          primary_tech_stack: string | null
          profile_complete: boolean
          programming_languages: string[] | null
          target_companies: string[] | null
          target_roles: string[] | null
          technologies: string[] | null
          theme_preference: string | null
          updated_at: string
          years_of_experience: number | null
        }
        Insert: {
          areas_of_interest?: string[] | null
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name?: string | null
          primary_tech_stack?: string | null
          profile_complete?: boolean
          programming_languages?: string[] | null
          target_companies?: string[] | null
          target_roles?: string[] | null
          technologies?: string[] | null
          theme_preference?: string | null
          updated_at?: string
          years_of_experience?: number | null
        }
        Update: {
          areas_of_interest?: string[] | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          primary_tech_stack?: string | null
          profile_complete?: boolean
          programming_languages?: string[] | null
          target_companies?: string[] | null
          target_roles?: string[] | null
          technologies?: string[] | null
          theme_preference?: string | null
          updated_at?: string
          years_of_experience?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
