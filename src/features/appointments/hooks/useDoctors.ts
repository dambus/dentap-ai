import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Tables } from '../../../types'

export type DoctorOption = Pick<
  Tables<'profiles'>,
  'id' | 'first_name' | 'last_name' | 'display_name' | 'color'
>

export function useDoctors() {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: async (): Promise<DoctorOption[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, display_name, color')
        .eq('is_doctor', true)
        .eq('is_active', true)
        .order('first_name')

      if (error) throw error
      return (data ?? []) as DoctorOption[]
    },
    staleTime: 1000 * 60 * 5,
  })
}
