import { useQuery } from '@tanstack/react-query'
import { startOfDay, endOfDay } from 'date-fns'
import { supabase } from '../../../lib/supabase'
import type { Tables } from '../../../types'

export interface AppointmentWithRelations extends Tables<'appointments'> {
  patient: Pick<Tables<'patients'>, 'id' | 'first_name' | 'last_name' | 'phone'>
  doctor: Pick<Tables<'profiles'>, 'id' | 'first_name' | 'last_name' | 'display_name' | 'color'>
}

export function useAppointments(date: Date) {
  const start = startOfDay(date).toISOString()
  const end = endOfDay(date).toISOString()

  return useQuery({
    queryKey: ['appointments', 'daily', start],
    queryFn: async (): Promise<AppointmentWithRelations[]> => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients ( id, first_name, last_name, phone ),
          doctor:profiles!doctor_id ( id, first_name, last_name, display_name, color )
        `)
        .gte('starts_at', start)
        .lt('starts_at', end)
        .neq('status', 'cancelled')
        .order('starts_at')

      if (error) throw error
      return (data ?? []) as unknown as AppointmentWithRelations[]
    },
    staleTime: 1000 * 30,
  })
}
