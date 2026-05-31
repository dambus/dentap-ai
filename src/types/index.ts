import type { Database } from './database.types'

// Shortcut tipovi iz generisane sheme
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Domenski tipovi
export type Clinic = Tables<'clinics'>
export type Profile = Tables<'profiles'>
export type Patient = Tables<'patients'>
export type Appointment = Tables<'appointments'>
export type Visit = Tables<'visits'>
export type VisitProcedure = Tables<'visit_procedures'>
export type Service = Tables<'services'>
export type PatientMedicalRecord = Tables<'patient_medical_records'>
export type OdontogramTooth = Tables<'odontogram_teeth'>
export type TreatmentPlan = Tables<'treatment_plans'>
export type TreatmentPlanItem = Tables<'treatment_plan_items'>
export type AgentConversation = Tables<'agent_conversations'>

export type UserRole =
  | 'owner'
  | 'doctor'
  | 'specialist'
  | 'assistant'
  | 'reception'
  | 'inventory'

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'
export type ArrivalStatus = 'not_arrived' | 'arrived' | 'in_chair' | 'completed'
export type VisitStatus = 'draft' | 'completed'
export type PlanStatus =
  | 'draft'
  | 'proposed'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'archived'
