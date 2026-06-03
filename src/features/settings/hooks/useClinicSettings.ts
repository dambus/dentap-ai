import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Tables } from '../../../types'

export type ClinicRow = Tables<'clinics'>

export function useClinicSettings(clinicId: string | null) {
  return useQuery({
    queryKey: ['clinic', clinicId],
    queryFn: async (): Promise<ClinicRow | null> => {
      if (!clinicId) return null
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', clinicId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdateClinic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      clinicId,
      data,
    }: {
      clinicId: string
      data: Partial<Pick<ClinicRow, 'name' | 'address' | 'city' | 'phone' | 'email' | 'tax_id' | 'maticni_broj' | 'organizaciona_jedinica'>>
    }) => {
      const { error } = await supabase
        .from('clinics')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', clinicId)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clinic', variables.clinicId] })
    },
  })
}
