export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_explanations: {
        Row: {
          created_at: string
          explanation: string
          id: string
          patient_history: Json | null
          predicted_stress_level: string | null
          user_id: string
          vitals: Json | null
        }
        Insert: {
          created_at?: string
          explanation: string
          id?: string
          patient_history?: Json | null
          predicted_stress_level?: string | null
          user_id: string
          vitals?: Json | null
        }
        Update: {
          created_at?: string
          explanation?: string
          id?: string
          patient_history?: Json | null
          predicted_stress_level?: string | null
          user_id?: string
          vitals?: Json | null
        }
        Relationships: []
      }
      biometric_data_enhanced: {
        Row: {
          ambient_temperature: number | null
          arrhythmia_detected: boolean | null
          created_at: string | null
          device_status: Json | null
          gsr_baseline: number | null
          gsr_change: number | null
          gsr_value: number | null
          heart_rate: number | null
          heart_rate_variability: number | null
          id: string
          leads_off_detected: boolean | null
          raw_ecg_signal: number | null
          stress_level: string | null
          stress_score: number | null
          temperature: number | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          ambient_temperature?: number | null
          arrhythmia_detected?: boolean | null
          created_at?: string | null
          device_status?: Json | null
          gsr_baseline?: number | null
          gsr_change?: number | null
          gsr_value?: number | null
          heart_rate?: number | null
          heart_rate_variability?: number | null
          id?: string
          leads_off_detected?: boolean | null
          raw_ecg_signal?: number | null
          stress_level?: string | null
          stress_score?: number | null
          temperature?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          ambient_temperature?: number | null
          arrhythmia_detected?: boolean | null
          created_at?: string | null
          device_status?: Json | null
          gsr_baseline?: number | null
          gsr_change?: number | null
          gsr_value?: number | null
          heart_rate?: number | null
          heart_rate_variability?: number | null
          id?: string
          leads_off_detected?: boolean | null
          raw_ecg_signal?: number | null
          stress_level?: string | null
          stress_score?: number | null
          temperature?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          id: string
          is_user: boolean
          message: string
          session_id: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          is_user: boolean
          message: string
          session_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          is_user?: boolean
          message?: string
          session_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          message: string
          status: string | null
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          message: string
          status?: string | null
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          message?: string
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      daily_metrics: {
        Row: {
          avg_heart_rate: number | null
          avg_stress_level: number | null
          created_at: string | null
          date: string
          exercise_minutes: number | null
          id: string
          max_heart_rate: number | null
          max_stress_level: number | null
          min_heart_rate: number | null
          min_stress_level: number | null
          mood_rating: number | null
          notes: string | null
          sleep_hours: number | null
          user_id: string | null
          water_intake: number | null
        }
        Insert: {
          avg_heart_rate?: number | null
          avg_stress_level?: number | null
          created_at?: string | null
          date: string
          exercise_minutes?: number | null
          id?: string
          max_heart_rate?: number | null
          max_stress_level?: number | null
          min_heart_rate?: number | null
          min_stress_level?: number | null
          mood_rating?: number | null
          notes?: string | null
          sleep_hours?: number | null
          user_id?: string | null
          water_intake?: number | null
        }
        Update: {
          avg_heart_rate?: number | null
          avg_stress_level?: number | null
          created_at?: string | null
          date?: string
          exercise_minutes?: number | null
          id?: string
          max_heart_rate?: number | null
          max_stress_level?: number | null
          min_heart_rate?: number | null
          min_stress_level?: number | null
          mood_rating?: number | null
          notes?: string | null
          sleep_hours?: number | null
          user_id?: string | null
          water_intake?: number | null
        }
        Relationships: []
      }
      facial_analysis: {
        Row: {
          confidence: number
          created_at: string
          emotion: string
          id: string
          stress_level: number
          timestamp: string
          user_id: string
        }
        Insert: {
          confidence: number
          created_at?: string
          emotion: string
          id?: string
          stress_level: number
          timestamp?: string
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          emotion?: string
          id?: string
          stress_level?: number
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      health_records: {
        Row: {
          condition: string
          created_at: string | null
          diagnosis_date: string | null
          id: string
          medications: string[] | null
          notes: string | null
          severity: string | null
          status: string | null
          symptoms: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          condition: string
          created_at?: string | null
          diagnosis_date?: string | null
          id?: string
          medications?: string[] | null
          notes?: string | null
          severity?: string | null
          status?: string | null
          symptoms?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          condition?: string
          created_at?: string | null
          diagnosis_date?: string | null
          id?: string
          medications?: string[] | null
          notes?: string | null
          severity?: string | null
          status?: string | null
          symptoms?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          message: string
          priority: string | null
          read: boolean | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          priority?: string | null
          read?: boolean | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sensor_data: {
        Row: {
          ambient_temperature: number | null
          arrhythmia_detected: boolean | null
          device_id: string | null
          device_status: Json | null
          gsr_baseline: number | null
          gsr_change: number | null
          gsr_value: number | null
          heart_rate: number | null
          heart_rate_variability: number | null
          id: string
          leads_off_detected: boolean | null
          raw_ecg_signal: number | null
          temperature: number | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          ambient_temperature?: number | null
          arrhythmia_detected?: boolean | null
          device_id?: string | null
          device_status?: Json | null
          gsr_baseline?: number | null
          gsr_change?: number | null
          gsr_value?: number | null
          heart_rate?: number | null
          heart_rate_variability?: number | null
          id?: string
          leads_off_detected?: boolean | null
          raw_ecg_signal?: number | null
          temperature?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          ambient_temperature?: number | null
          arrhythmia_detected?: boolean | null
          device_id?: string | null
          device_status?: Json | null
          gsr_baseline?: number | null
          gsr_change?: number | null
          gsr_value?: number | null
          heart_rate?: number | null
          heart_rate_variability?: number | null
          id?: string
          leads_off_detected?: boolean | null
          raw_ecg_signal?: number | null
          temperature?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stress_predictions: {
        Row: {
          combined_score: number | null
          confidence: number | null
          facial_score: number | null
          gsr_value: number | null
          heart_rate: number | null
          id: string
          physiological_score: number | null
          stress_level: string | null
          temperature: number | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          combined_score?: number | null
          confidence?: number | null
          facial_score?: number | null
          gsr_value?: number | null
          heart_rate?: number | null
          id?: string
          physiological_score?: number | null
          stress_level?: string | null
          temperature?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          combined_score?: number | null
          confidence?: number | null
          facial_score?: number | null
          gsr_value?: number | null
          heart_rate?: number | null
          id?: string
          physiological_score?: number | null
          stress_level?: string | null
          temperature?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          allergies: string[] | null
          blood_type: string | null
          created_at: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          height: number | null
          id: string
          medical_conditions: string[] | null
          medications: string[] | null
          preferred_notification_time: string | null
          sleep_target_hours: number | null
          stress_threshold_high: number | null
          stress_threshold_low: number | null
          stress_threshold_medium: number | null
          updated_at: string | null
          user_id: string
          water_intake_target: number | null
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          allergies?: string[] | null
          blood_type?: string | null
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          height?: number | null
          id?: string
          medical_conditions?: string[] | null
          medications?: string[] | null
          preferred_notification_time?: string | null
          sleep_target_hours?: number | null
          stress_threshold_high?: number | null
          stress_threshold_low?: number | null
          stress_threshold_medium?: number | null
          updated_at?: string | null
          user_id: string
          water_intake_target?: number | null
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          allergies?: string[] | null
          blood_type?: string | null
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          height?: number | null
          id?: string
          medical_conditions?: string[] | null
          medications?: string[] | null
          preferred_notification_time?: string | null
          sleep_target_hours?: number | null
          stress_threshold_high?: number | null
          stress_threshold_low?: number | null
          stress_threshold_medium?: number | null
          updated_at?: string | null
          user_id?: string
          water_intake_target?: number | null
          weight?: number | null
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
