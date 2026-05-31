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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
      agent_conversations: {
        Row: {
          clinic_id: string
          context_id: string | null
          context_type: string | null
          id: string
          messages: Json | null
          started_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          clinic_id: string
          context_id?: string | null
          context_type?: string | null
          id?: string
          messages?: Json | null
          started_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          clinic_id?: string
          context_id?: string | null
          context_type?: string | null
          id?: string
          messages?: Json | null
          started_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_conversations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_type: string | null
          arrival_status: string | null
          cancellation_reason: string | null
          cancelled_by: string | null
          clinic_id: string
          created_at: string | null
          created_by: string | null
          doctor_id: string
          duration_min: number | null
          ends_at: string
          id: string
          notes: string | null
          patient_id: string
          starts_at: string
          status: string | null
          title: string | null
          treatment_plan_id: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_type?: string | null
          arrival_status?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          clinic_id: string
          created_at?: string | null
          created_by?: string | null
          doctor_id: string
          duration_min?: number | null
          ends_at: string
          id?: string
          notes?: string | null
          patient_id: string
          starts_at: string
          status?: string | null
          title?: string | null
          treatment_plan_id?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_type?: string | null
          arrival_status?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          clinic_id?: string
          created_at?: string | null
          created_by?: string | null
          doctor_id?: string
          duration_min?: number | null
          ends_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          starts_at?: string
          status?: string | null
          title?: string | null
          treatment_plan_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          clinic_id: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          clinic_id: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          clinic_id?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          settings: Json | null
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          settings?: Json | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          settings?: Json | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      odontogram_teeth: {
        Row: {
          clinic_id: string
          created_at: string | null
          id: string
          patient_id: string
          status: string | null
          surfaces: Json | null
          tooth_fdi: string
          treatment_note: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          id?: string
          patient_id: string
          status?: string | null
          surfaces?: Json | null
          tooth_fdi: string
          treatment_note?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          id?: string
          patient_id?: string
          status?: string | null
          surfaces?: Json | null
          tooth_fdi?: string
          treatment_note?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "odontogram_teeth_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "odontogram_teeth_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "odontogram_teeth_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_medical_records: {
        Row: {
          allergies: string[] | null
          clinic_id: string
          created_at: string | null
          dental_anamnesis: string | null
          extra_data: Json | null
          general_anamnesis: string | null
          id: string
          medical_alerts: string | null
          medications: string[] | null
          patient_id: string
          systemic_diseases: string[] | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          allergies?: string[] | null
          clinic_id: string
          created_at?: string | null
          dental_anamnesis?: string | null
          extra_data?: Json | null
          general_anamnesis?: string | null
          id?: string
          medical_alerts?: string | null
          medications?: string[] | null
          patient_id: string
          systemic_diseases?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          allergies?: string[] | null
          clinic_id?: string
          created_at?: string | null
          dental_anamnesis?: string | null
          extra_data?: Json | null
          general_anamnesis?: string | null
          id?: string
          medical_alerts?: string | null
          medications?: string[] | null
          patient_id?: string
          systemic_diseases?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_medical_records_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_medical_records_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          city: string | null
          clinic_id: string
          created_at: string | null
          created_by: string | null
          date_of_birth: string | null
          deleted_at: string | null
          email: string | null
          first_name: string
          gender: string | null
          id: string
          is_active: boolean | null
          jmbg: string | null
          last_name: string
          notes: string | null
          phone: string | null
          phone_alt: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          clinic_id: string
          created_at?: string | null
          created_by?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          first_name: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          jmbg?: string | null
          last_name: string
          notes?: string | null
          phone?: string | null
          phone_alt?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          clinic_id?: string
          created_at?: string | null
          created_by?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          jmbg?: string | null
          last_name?: string
          notes?: string | null
          phone?: string | null
          phone_alt?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          clinic_id: string
          color: string | null
          created_at: string | null
          display_name: string | null
          first_name: string
          id: string
          is_active: boolean | null
          is_doctor: boolean | null
          last_name: string
          phone: string | null
          role: string
          specialty: string | null
          updated_at: string | null
        }
        Insert: {
          clinic_id: string
          color?: string | null
          created_at?: string | null
          display_name?: string | null
          first_name: string
          id: string
          is_active?: boolean | null
          is_doctor?: boolean | null
          last_name: string
          phone?: string | null
          role: string
          specialty?: string | null
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string
          color?: string | null
          created_at?: string | null
          display_name?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          is_doctor?: boolean | null
          last_name?: string
          phone?: string | null
          role?: string
          specialty?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          clinic_id: string
          created_at: string | null
          default_price: number | null
          duration_min: number | null
          id: string
          is_active: boolean | null
          name: string
          name_en: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          clinic_id: string
          created_at?: string | null
          default_price?: number | null
          duration_min?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          name_en?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          clinic_id?: string
          created_at?: string | null
          default_price?: number | null
          duration_min?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_en?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_plan_items: {
        Row: {
          clinic_id: string
          created_at: string | null
          description: string
          estimated_price: number | null
          id: string
          notes: string | null
          priority: number | null
          service_id: string | null
          sort_order: number | null
          status: string | null
          tooth_fdi: string | null
          treatment_plan_id: string
          updated_at: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          description: string
          estimated_price?: number | null
          id?: string
          notes?: string | null
          priority?: number | null
          service_id?: string | null
          sort_order?: number | null
          status?: string | null
          tooth_fdi?: string | null
          treatment_plan_id: string
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          description?: string
          estimated_price?: number | null
          id?: string
          notes?: string | null
          priority?: number | null
          service_id?: string | null
          sort_order?: number | null
          status?: string | null
          tooth_fdi?: string | null
          treatment_plan_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_plan_items_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plan_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plan_items_treatment_plan_id_fkey"
            columns: ["treatment_plan_id"]
            isOneToOne: false
            referencedRelation: "treatment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_plans: {
        Row: {
          clinic_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          doctor_id: string
          estimated_total: number | null
          id: string
          patient_id: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          doctor_id: string
          estimated_total?: number | null
          id?: string
          patient_id: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          doctor_id?: string
          estimated_total?: number | null
          id?: string
          patient_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_plans_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_procedures: {
        Row: {
          clinic_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          doctor_id: string
          id: string
          patient_id: string
          price: number | null
          service_id: string | null
          tooth_fdi: string | null
          visit_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          doctor_id: string
          id?: string
          patient_id: string
          price?: number | null
          service_id?: string | null
          tooth_fdi?: string | null
          visit_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          doctor_id?: string
          id?: string
          patient_id?: string
          price?: number | null
          service_id?: string | null
          tooth_fdi?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_procedures_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_procedures_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_procedures_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_procedures_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_procedures_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_procedures_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          appointment_id: string | null
          chief_complaint: string | null
          clinic_id: string
          clinical_notes: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          created_by: string | null
          diagnosis: string | null
          doctor_id: string
          ended_at: string | null
          id: string
          patient_id: string
          started_at: string | null
          status: string | null
          updated_at: string | null
          visit_date: string
        }
        Insert: {
          appointment_id?: string | null
          chief_complaint?: string | null
          clinic_id: string
          clinical_notes?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          diagnosis?: string | null
          doctor_id: string
          ended_at?: string | null
          id?: string
          patient_id: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          visit_date: string
        }
        Update: {
          appointment_id?: string | null
          chief_complaint?: string | null
          clinic_id?: string
          clinical_notes?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          diagnosis?: string | null
          doctor_id?: string
          ended_at?: string | null
          id?: string
          patient_id?: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_clinic_id: { Args: never; Returns: string }
      auth_role: { Args: never; Returns: string }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

