import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Tables } from '../../../types'

export type VisitDetail = Tables<'visits'>

export function useVisit(visitId: string) {
  return useQuery({
    queryKey: ['visit', visitId],
    queryFn: async (): Promise<VisitDetail | null> => {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          patient:patients ( first_name, last_name, phone ),
          doctor:profiles!doctor_id ( first_name, last_name, display_name )
        `)
        .eq('id', visitId)
        .maybeSingle()

      if (error) throw error
      return (data ?? null) as unknown as VisitDetail | null
    },
    enabled: !!visitId,
    staleTime: 1000 * 60,
  })
}

interface UpdateVisitData {
  chief_complaint?: string | null
  diagnosis?: string | null
  clinical_notes?: string | null
  status?: string
}

export function useUpdateVisit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ visitId, data }: { visitId: string; data: UpdateVisitData }) => {
      const { error } = await supabase
        .from('visits')
        .update(data)
        .eq('id', visitId)

      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['visit', variables.visitId] })
    },
  })
}
