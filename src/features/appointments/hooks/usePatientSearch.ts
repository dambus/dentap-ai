import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { normalizeSr } from '../../../lib/normalizeSr'
import type { Tables } from '../../../types'

export type PatientSearchResult = Pick<
  Tables<'patients'>,
  'id' | 'first_name' | 'last_name' | 'date_of_birth' | 'phone'
>

export function usePatientSearch(query: string) {
  const trimmed = query.trim()

  return useQuery({
    queryKey: ['patients', 'search', trimmed],
    queryFn: async (): Promise<PatientSearchResult[]> => {
      const norm = normalizeSr(trimmed)
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, date_of_birth, phone')
        .or(`search_text.ilike.%${norm}%,phone.ilike.%${trimmed}%`)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('last_name')
        .limit(10)

      if (error) throw error
      return (data ?? []) as PatientSearchResult[]
    },
    enabled: trimmed.length >= 2,
    staleTime: 1000 * 10,
  })
}
