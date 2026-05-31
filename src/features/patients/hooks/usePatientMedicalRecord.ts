import { useQuery } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Tables } from '../../../types'

export type PatientMedicalRecord = Tables<'patient_medical_records'>

export function usePatientMedicalRecord(patientId: string) {
  return useQuery({
    queryKey: ['patient', 'medical-record', patientId],
    queryFn: async (): Promise<PatientMedicalRecord | null> => {
      const { data, error } = await supabase
        .from('patient_medical_records')
        .select('*')
        .eq('patient_id', patientId)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!patientId,
    staleTime: 1000 * 60,
  })
}

interface UpdateMedicalRecordData {
  clinic_id: string
  patient_id: string
  general_anamnesis?: string | null
  allergies?: string[] | null
  medications?: string[] | null
  systemic_diseases?: string[] | null
  medical_alerts?: string | null
  dental_anamnesis?: string | null
  updated_by: string
}

export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateMedicalRecordData) => {
      const { error } = await supabase
        .from('patient_medical_records')
        .upsert(data, { onConflict: 'patient_id' })

      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['patient', 'medical-record', variables.patient_id],
      })
      queryClient.invalidateQueries({
        queryKey: ['patient', 'alerts', variables.patient_id],
      })
    },
  })
}
