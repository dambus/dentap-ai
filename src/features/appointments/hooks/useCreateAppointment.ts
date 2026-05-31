import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'

export interface NewAppointmentData {
  clinic_id: string
  patient_id: string
  doctor_id: string
  starts_at: string
  ends_at: string
  appointment_type: string
  notes?: string
  title?: string
  created_by: string
}

async function checkOverlap(
  doctorId: string,
  startsAt: string,
  endsAt: string,
  excludeId?: string
): Promise<boolean> {
  let query = supabase
    .from('appointments')
    .select('id')
    .eq('doctor_id', doctorId)
    .neq('status', 'cancelled')
    .lt('starts_at', endsAt)
    .gt('ends_at', startsAt)

  if (excludeId) query = query.neq('id', excludeId)

  const { data } = await query.limit(1)
  return (data ?? []).length > 0
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: NewAppointmentData) => {
      const hasOverlap = await checkOverlap(data.doctor_id, data.starts_at, data.ends_at)
      if (hasOverlap) {
        throw new Error('Termin se preklapa sa postojećim terminom ovog doktora.')
      }

      const { data: result, error } = await supabase
        .from('appointments')
        .insert(data)
        .select(`
          *,
          patient:patients ( id, first_name, last_name, phone ),
          doctor:profiles!doctor_id ( id, first_name, last_name, display_name, color )
        `)
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'appointments',
      })
    },
  })
}
