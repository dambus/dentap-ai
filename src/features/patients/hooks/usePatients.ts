import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { normalizeSr } from '../../../lib/normalizeSr'
import type { Tables } from '../../../types'

export type PatientListItem = Pick<
  Tables<'patients'>,
  'id' | 'first_name' | 'last_name' | 'date_of_birth' | 'phone' | 'city' | 'is_active' | 'created_at'
>

interface UsePatientsOptions {
  search?: string
  page?: number
  pageSize?: number
}

export function usePatients({ search = '', page = 1, pageSize = 20 }: UsePatientsOptions = {}) {
  const trimmed = search.trim()

  return useQuery({
    queryKey: ['patients', 'list', trimmed, page, pageSize],
    queryFn: async (): Promise<{ patients: PatientListItem[]; total: number }> => {
      let query = supabase
        .from('patients')
        .select('id, first_name, last_name, date_of_birth, phone, city, is_active, created_at', {
          count: 'exact',
        })
        .is('deleted_at', null)
        .order('last_name')
        .order('first_name')

      if (trimmed) {
        const norm = normalizeSr(trimmed)
        query = query.or(`search_text.ilike.%${norm}%,phone.ilike.%${trimmed}%`)
      } else {
        query = query.range((page - 1) * pageSize, page * pageSize - 1)
      }

      const { data, error, count } = await query
      if (error) throw error
      return { patients: (data ?? []) as PatientListItem[], total: count ?? 0 }
    },
    staleTime: 1000 * 30,
  })
}
