import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { supabase } from '../../../lib/supabase'

export interface StaleVisit {
  id: string
  visit_date: string
  patient_id: string
  patient: { first_name: string; last_name: string } | null
}

// Stale = draft poseta sa visit_date < danas (prethodni dani, nije zatvoren)
export function useStaleVisits(clinicId: string | null) {
  const today = format(new Date(), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['visits', 'stale', clinicId, today],
    queryFn: async (): Promise<StaleVisit[]> => {
      if (!clinicId) return []

      const { data, error } = await supabase
        .from('visits')
        .select('id, visit_date, patient_id, patient:patients(first_name, last_name)')
        .eq('clinic_id', clinicId)
        .eq('status', 'draft')
        .lt('visit_date', today)
        .order('visit_date', { ascending: false })

      if (error) throw error
      return (data ?? []) as unknown as StaleVisit[]
    },
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  })
}

export function isVisitStale(visitDate: string): boolean {
  const today = format(new Date(), 'yyyy-MM-dd')
  return visitDate < today
}
