import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { TablesInsert } from '../../../types'

type NewPatientData = Omit<TablesInsert<'patients'>, 'id' | 'created_at' | 'updated_at'>

export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: NewPatientData) => {
      const { data: patient, error } = await supabase
        .from('patients')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return patient
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}
