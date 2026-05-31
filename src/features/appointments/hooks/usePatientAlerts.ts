import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'

export interface PatientAlerts {
  medical_alerts: string | null
  allergies: string[] | null
}

export function usePatientAlerts(patientId: string | null) {
  return useQuery({
    queryKey: ['patient', 'alerts', patientId],
    queryFn: async (): Promise<PatientAlerts | null> => {
      const { data, error } = await supabase
        .from('patient_medical_records')
        .select('medical_alerts, allergies')
        .eq('patient_id', patientId!)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5,
  })
}
