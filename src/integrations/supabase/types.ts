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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      appointment_statuses: {
        Row: {
          active: boolean | null
          color: string | null
          created_at: string | null
          id: number
          key: string
          label: string
        }
        Insert: {
          active?: boolean | null
          color?: string | null
          created_at?: string | null
          id?: number
          key: string
          label: string
        }
        Update: {
          active?: boolean | null
          color?: string | null
          created_at?: string | null
          id?: number
          key?: string
          label?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_blocked: boolean | null
          notes: string | null
          patient_id: string | null
          payment_method: string | null
          payment_status: string | null
          price: number | null
          procedure_id: string | null
          professional_id: string | null
          start_time: string
          status_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_blocked?: boolean | null
          notes?: string | null
          patient_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          price?: number | null
          procedure_id?: string | null
          professional_id?: string | null
          start_time: string
          status_id?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_blocked?: boolean | null
          notes?: string | null
          patient_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          price?: number | null
          procedure_id?: string | null
          professional_id?: string | null
          start_time?: string
          status_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointments_status"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "appointment_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      cupons: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          id: string
          limite_uso: number
          updated_at: string
          uso_atual: number
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          id?: string
          limite_uso?: number
          updated_at?: string
          uso_atual?: number
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          id?: string
          limite_uso?: number
          updated_at?: string
          uso_atual?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          appointment_id: string | null
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      patient_records: {
        Row: {
          appointment_id: string | null
          content: string | null
          created_at: string
          created_by: string | null
          files: Json | null
          icd_code: string | null
          icd_version: string | null
          id: string
          notes: string | null
          patient_id: string | null
          prescription: string | null
          professional_id: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          files?: Json | null
          icd_code?: string | null
          icd_version?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          prescription?: string | null
          professional_id?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          files?: Json | null
          icd_code?: string | null
          icd_version?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          prescription?: string | null
          professional_id?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_records_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          active: boolean | null
          birth_date: string | null
          city: string | null
          cpf: string | null
          created_at: string
          email: string | null
          full_name: string
          gender: string | null
          health_insurance: string | null
          height_cm: number | null
          id: string
          marital_status: string | null
          neighborhood: string | null
          notes: string | null
          number: string | null
          phone: string | null
          photo_url: string | null
          profession: string | null
          responsible_cpf: string | null
          responsible_name: string | null
          state: string | null
          street: string | null
          sus_card: string | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          active?: boolean | null
          birth_date?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          gender?: string | null
          health_insurance?: string | null
          height_cm?: number | null
          id?: string
          marital_status?: string | null
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          phone?: string | null
          photo_url?: string | null
          profession?: string | null
          responsible_cpf?: string | null
          responsible_name?: string | null
          state?: string | null
          street?: string | null
          sus_card?: string | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          active?: boolean | null
          birth_date?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          gender?: string | null
          health_insurance?: string | null
          height_cm?: number | null
          id?: string
          marital_status?: string | null
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          phone?: string | null
          photo_url?: string | null
          profession?: string | null
          responsible_cpf?: string | null
          responsible_name?: string | null
          state?: string | null
          street?: string | null
          sus_card?: string | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      procedure_professionals: {
        Row: {
          created_at: string
          id: string
          procedure_id: string
          professional_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          procedure_id: string
          professional_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          procedure_id?: string
          professional_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "procedure_professionals_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procedure_professionals_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      procedures: {
        Row: {
          active: boolean | null
          created_at: string
          default_duration: number
          description: string | null
          id: string
          name: string
          price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          default_duration?: number
          description?: string | null
          id?: string
          name: string
          price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          default_duration?: number
          description?: string | null
          id?: string
          name?: string
          price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      professionals: {
        Row: {
          active: boolean | null
          break_times: Json | null
          color: string | null
          created_at: string
          crm_cro: string | null
          email: string | null
          first_shift_end: string | null
          first_shift_start: string | null
          id: string
          name: string
          phone: string | null
          second_shift_end: string | null
          second_shift_start: string | null
          specialty: string | null
          updated_at: string
          user_id: string
          vacation_active: boolean | null
          vacation_end: string | null
          vacation_start: string | null
          weekend_shift_active: boolean | null
          weekend_shift_end: string | null
          weekend_shift_start: string | null
          working_days: Json | null
          working_hours: Json | null
        }
        Insert: {
          active?: boolean | null
          break_times?: Json | null
          color?: string | null
          created_at?: string
          crm_cro?: string | null
          email?: string | null
          first_shift_end?: string | null
          first_shift_start?: string | null
          id?: string
          name: string
          phone?: string | null
          second_shift_end?: string | null
          second_shift_start?: string | null
          specialty?: string | null
          updated_at?: string
          user_id: string
          vacation_active?: boolean | null
          vacation_end?: string | null
          vacation_start?: string | null
          weekend_shift_active?: boolean | null
          weekend_shift_end?: string | null
          weekend_shift_start?: string | null
          working_days?: Json | null
          working_hours?: Json | null
        }
        Update: {
          active?: boolean | null
          break_times?: Json | null
          color?: string | null
          created_at?: string
          crm_cro?: string | null
          email?: string | null
          first_shift_end?: string | null
          first_shift_start?: string | null
          id?: string
          name?: string
          phone?: string | null
          second_shift_end?: string | null
          second_shift_start?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
          vacation_active?: boolean | null
          vacation_end?: string | null
          vacation_start?: string | null
          weekend_shift_active?: boolean | null
          weekend_shift_end?: string | null
          weekend_shift_start?: string | null
          working_days?: Json | null
          working_hours?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          automacao: boolean
          city: string | null
          cnpj: string | null
          company_logo: string | null
          company_name: string | null
          cpf: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          neighborhood: string | null
          number: string | null
          phone: string | null
          state: string | null
          street: string | null
          updated_at: string
          working_hours_end: string | null
          working_hours_start: string | null
          zip_code: string | null
        }
        Insert: {
          automacao?: boolean
          city?: string | null
          cnpj?: string | null
          company_logo?: string | null
          company_name?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string
          working_hours_end?: string | null
          working_hours_start?: string | null
          zip_code?: string | null
        }
        Update: {
          automacao?: boolean
          city?: string | null
          cnpj?: string | null
          company_logo?: string | null
          company_name?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string
          working_hours_end?: string | null
          working_hours_start?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      prontuario_documents: {
        Row: {
          appointment_id: string | null
          created_at: string
          description: string | null
          file_path: string
          file_size: number
          id: string
          mime_type: string
          name: string
          patient_id: string | null
          record_id: string | null
          uploaded_at: string
          uploaded_by: string | null
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          description?: string | null
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          name: string
          patient_id?: string | null
          record_id?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
          user_id: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          name?: string
          patient_id?: string | null
          record_id?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prontuario_documents_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prontuario_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prontuario_documents_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "patient_records"
            referencedColumns: ["id"]
          },
        ]
      }
      record_appointments: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          record_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          record_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          record_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      subscription_limits: {
        Row: {
          created_at: string
          has_ehr_access: boolean
          id: string
          max_appointments: number
          max_patients: number
          max_procedures: number
          max_professionals: number
          plan_type: string
        }
        Insert: {
          created_at?: string
          has_ehr_access?: boolean
          id?: string
          max_appointments: number
          max_patients: number
          max_procedures: number
          max_professionals: number
          plan_type: string
        }
        Update: {
          created_at?: string
          has_ehr_access?: boolean
          id?: string
          max_appointments?: number
          max_patients?: number
          max_procedures?: number
          max_professionals?: number
          plan_type?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_usage_stats: {
        Args: { p_user_id: string }
        Returns: {
          appointments_count: number
          patients_count: number
          procedures_count: number
          professionals_count: number
        }[]
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
