import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Tables } from '../../../types'

export type PatientVisit = Tables<'visits'> & {
  doctor: { display_name: string | null; first_name: string; last_name: string } | null
  procedure_count: number
}

export function useVisitsForPatient(patientId: string) {
  return useQuery({
    queryKey: ['visits', 'patient', patientId],
    queryFn: async (): Promise<PatientVisit[]> => {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          doctor:profiles!doctor_id ( display_name, first_name, last_name ),
          procedures:visit_procedures ( id )
        `)
        .eq('patient_id', patientId)
        .order('visit_date', { ascending: false })

      if (error) throw error

      return (data ?? []).map((v) => ({
        ...v,
        doctor: (v as unknown as { doctor: PatientVisit['doctor'] }).doctor,
        procedure_count: ((v as unknown as { procedures: { id: string }[] }).procedures ?? [])
          .length,
      }))
    },
    enabled: !!patientId,
    staleTime: 1000 * 30,
  })
}
