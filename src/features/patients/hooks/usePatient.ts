import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Tables } from '../../../types'

export type PatientDetail = Tables<'patients'>

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async (): Promise<PatientDetail | null> => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!id,
    staleTime: 1000 * 60,
  })
}
