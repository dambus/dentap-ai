import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'

export function usePatientNextAppointment(patientId: string) {
  return useQuery({
    queryKey: ['patient', 'next-appointment', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id, starts_at, ends_at, appointment_type, status, arrival_status, notes,
          doctor:profiles!doctor_id ( first_name, last_name, display_name )
        `)
        .eq('patient_id', patientId)
        .eq('status', 'scheduled')
        .gte('starts_at', new Date().toISOString())
        .order('starts_at')
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!patientId,
    staleTime: 1000 * 30,
  })
}

export function usePatientLastVisit(patientId: string) {
  return useQuery({
    queryKey: ['patient', 'last-visit', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          id, visit_date, chief_complaint, diagnosis, status,
          doctor:profiles!doctor_id ( first_name, last_name, display_name )
        `)
        .eq('patient_id', patientId)
        .eq('status', 'completed')
        .order('visit_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!patientId,
    staleTime: 1000 * 60,
  })
}

export function usePatientActivePlan(patientId: string) {
  return useQuery({
    queryKey: ['patient', 'active-plan', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('treatment_plans')
        .select(`
          id, title, status, estimated_total,
          items:treatment_plan_items ( id, status )
        `)
        .eq('patient_id', patientId)
        .in('status', ['accepted', 'in_progress', 'proposed'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!patientId,
    staleTime: 1000 * 60,
  })
}
