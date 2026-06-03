import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Tables, TablesInsert } from '../../../types'

export type ServiceRow = Tables<'services'>

export const SERVICE_CATEGORIES = [
  'dijagnostika',
  'terapija',
  'hirurgija',
  'ortodoncija',
  'protetika',
  'prevencija',
  'estetika',
] as const

export const CATEGORY_LABELS: Record<string, string> = {
  dijagnostika: 'Dijagnostika',
  terapija: 'Terapija',
  hirurgija: 'Hirurgija',
  ortodoncija: 'Ortodoncija',
  protetika: 'Protetika',
  prevencija: 'Prevencija',
  estetika: 'Estetika',
}

export function useServicesAll(clinicId: string | null) {
  return useQuery({
    queryKey: ['services-all', clinicId],
    queryFn: async (): Promise<ServiceRow[]> => {
      if (!clinicId) return []
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('category')
        .order('sort_order')
        .order('name')
      if (error) throw error
      return data ?? []
    },
    enabled: !!clinicId,
    staleTime: 1000 * 60,
  })
}

export function useCreateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: TablesInsert<'services'>) => {
      const { error } = await supabase.from('services').insert(data)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services-all', variables.clinic_id] })
      queryClient.invalidateQueries({ queryKey: ['services', variables.clinic_id] })
    },
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      clinicId,
      data,
    }: {
      id: string
      clinicId: string
      data: Partial<Pick<ServiceRow, 'name' | 'category' | 'default_price' | 'duration_min' | 'is_active' | 'sort_order'>>
    }) => {
      const { error } = await supabase
        .from('services')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      return clinicId
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services-all', variables.clinicId] })
      queryClient.invalidateQueries({ queryKey: ['services', variables.clinicId] })
    },
  })
}
