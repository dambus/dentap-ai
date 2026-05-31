import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Tables } from '../../../types'

export type TreatmentPlan = Tables<'treatment_plans'>
export type TreatmentPlanItem = Tables<'treatment_plan_items'>

export function useTreatmentPlansForVisit(visitId: string) {
  return useQuery({
    queryKey: ['visit', 'treatment-plans', visitId],
    queryFn: async (): Promise<
      (TreatmentPlan & { items: TreatmentPlanItem[] })[]
    > => {
      // Get patient_id from visit
      const { data: visit, error: visitError } = await supabase
        .from('visits')
        .select('patient_id')
        .eq('id', visitId)
        .single()

      if (visitError || !visit?.patient_id) return []

      // Get treatment plans for this patient
      const { data, error } = await supabase
        .from('treatment_plans')
        .select(`
          *,
          items:treatment_plan_items ( * )
        `)
        .eq('patient_id', visit.patient_id)
        .in('status', ['proposed', 'accepted', 'in_progress'])

      if (error) throw error
      return (data ?? []) as unknown as (TreatmentPlan & { items: TreatmentPlanItem[] })[]
    },
    enabled: !!visitId,
    staleTime: 1000 * 30,
  })
}

interface UpdatePlanItemStatusData {
  itemId: string
  status: 'pending' | 'completed' | 'skipped'
}

export function useUpdateTreatmentPlanItemStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ itemId, status }: UpdatePlanItemStatusData) => {
      const { error } = await supabase
        .from('treatment_plan_items')
        .update({ status })
        .eq('id', itemId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visit', 'treatment-plans'] })
    },
  })
}
