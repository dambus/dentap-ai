import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Tables, TablesInsert } from '../../../types'

export type TreatmentPlan = Tables<'treatment_plans'>
export type TreatmentPlanItem = Tables<'treatment_plan_items'>
export type TreatmentPlanWithItems = TreatmentPlan & { items: TreatmentPlanItem[] }

export type PlanStatus = 'draft' | 'proposed' | 'accepted' | 'in_progress' | 'completed' | 'archived'
export type ItemStatus = 'planned' | 'in_progress' | 'completed' | 'skipped'

export function useTreatmentPlans(patientId: string) {
  return useQuery({
    queryKey: ['treatment-plans', patientId],
    queryFn: async (): Promise<TreatmentPlanWithItems[]> => {
      const { data, error } = await supabase
        .from('treatment_plans')
        .select('*, items:treatment_plan_items(*)')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data ?? []) as unknown as TreatmentPlanWithItems[]
    },
    enabled: !!patientId,
    staleTime: 1000 * 30,
  })
}

export function useCreateTreatmentPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TablesInsert<'treatment_plans'>) => {
      const { data: created, error } = await supabase
        .from('treatment_plans')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return created
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['treatment-plans', variables.patient_id] })
    },
  })
}

export function useUpdateTreatmentPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      planId,
      patientId,
      data,
    }: {
      planId: string
      patientId: string
      data: { status?: PlanStatus; title?: string; estimated_total?: number | null }
    }) => {
      const { error } = await supabase
        .from('treatment_plans')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', planId)

      if (error) throw error
      return patientId
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['treatment-plans', variables.patientId] })
    },
  })
}

export function useCreateTreatmentPlanItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: TablesInsert<'treatment_plan_items'> & { patient_id: string },
    ) => {
      const { patient_id: _pid, ...insertData } = data
      const { error } = await supabase.from('treatment_plan_items').insert(insertData)

      if (error) throw error
      return data.patient_id
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['treatment-plans', variables.patient_id] })
    },
  })
}

export function useUpdateTreatmentPlanItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      itemId,
      patientId,
      data,
    }: {
      itemId: string
      patientId: string
      data: { status?: ItemStatus }
    }) => {
      const { error } = await supabase
        .from('treatment_plan_items')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', itemId)

      if (error) throw error
      return patientId
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['treatment-plans', variables.patientId] })
    },
  })
}

export function useDeleteTreatmentPlanItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ itemId, patientId }: { itemId: string; patientId: string }) => {
      const { error } = await supabase
        .from('treatment_plan_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      return patientId
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['treatment-plans', variables.patientId] })
    },
  })
}
