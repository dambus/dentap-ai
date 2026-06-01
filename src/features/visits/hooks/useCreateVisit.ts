import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { supabase } from '../../../lib/supabase'

interface NewVisitData {
  clinic_id: string
  patient_id: string
  doctor_id: string
  appointment_id?: string | null
  visit_date: string
  created_by: string
}

export function useCreateVisit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: NewVisitData) => {
      // Ako postoji termin, proveri da li poseta već postoji za njega
      if (data.appointment_id) {
        const { data: existing } = await supabase
          .from('visits')
          .select('id')
          .eq('appointment_id', data.appointment_id)
          .maybeSingle()

        if (existing) return existing
      }

      const { data: visit, error } = await supabase
        .from('visits')
        .insert({ ...data, status: 'draft', started_at: new Date().toISOString() })
        .select()
        .single()

      if (error) throw error
      return visit
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function todayDateString() {
  return format(new Date(), 'yyyy-MM-dd')
}
