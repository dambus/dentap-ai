import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Tables } from '../../../types'

export type Service = Tables<'services'>

export function useServices(clinicId: string) {
  return useQuery({
    queryKey: ['services', clinicId],
    queryFn: async (): Promise<Service[]> => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      return data ?? []
    },
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 10,
  })
}
