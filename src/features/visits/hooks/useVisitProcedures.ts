import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Tables } from '../../../types'

export type VisitProcedure = Tables<'visit_procedures'>

export function useVisitProcedures(visitId: string) {
  return useQuery({
    queryKey: ['visit', 'procedures', visitId],
    queryFn: async (): Promise<VisitProcedure[]> => {
      const { data, error } = await supabase
        .from('visit_procedures')
        .select('*')
        .eq('visit_id', visitId)
        .order('created_at')

      if (error) throw error
      return (data ?? []) as unknown as VisitProcedure[]
    },
    enabled: !!visitId,
    staleTime: 1000 * 30,
  })
}

interface CreateProcedureData {
  clinic_id: string
  visit_id: string
  patient_id: string
  doctor_id: string
  service_id?: string | null
  description?: string | null
  tooth_fdi?: string | null
  price?: number | null
}

export function useCreateVisitProcedure() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateProcedureData) => {
      const { data: procedure, error } = await supabase
        .from('visit_procedures')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return procedure
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['visit', 'procedures', variables.visit_id] })
    },
  })
}
