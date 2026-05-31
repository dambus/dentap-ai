import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Tables } from '../../../types'

export type VisitListItem = Pick<
  Tables<'visits'>,
  'id' | 'patient_id' | 'visit_date' | 'diagnosis' | 'status' | 'created_at'
> & {
  patient: Pick<Tables<'patients'>, 'first_name' | 'last_name'>
  doctor: Pick<Tables<'profiles'>, 'first_name' | 'last_name' | 'display_name'>
}

interface UseVisitsOptions {
  page?: number
  pageSize?: number
  patientId?: string
}

export function useVisits({ page = 1, pageSize = 20, patientId }: UseVisitsOptions = {}) {
  return useQuery({
    queryKey: ['visits', 'list', page, pageSize, patientId],
    queryFn: async (): Promise<{ visits: VisitListItem[]; total: number }> => {
      let query = supabase
        .from('visits')
        .select(
          `
          id, patient_id, visit_date, diagnosis, status, created_at,
          patient:patients ( first_name, last_name ),
          doctor:profiles!doctor_id ( first_name, last_name, display_name )
        `,
          { count: 'exact' }
        )
        .order('visit_date', { ascending: false })

      if (patientId) {
        query = query.eq('patient_id', patientId)
      } else {
        query = query.range((page - 1) * pageSize, page * pageSize - 1)
      }

      const { data, error, count } = await query
      if (error) throw error
      return { visits: (data ?? []) as unknown as VisitListItem[], total: count ?? 0 }
    },
    staleTime: 1000 * 30,
  })
}
