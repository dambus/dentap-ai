import { useQuery } from '@tanstack/react-query'
import { startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns'
import { format } from 'date-fns'
import { supabase } from '../../../lib/supabase'
import type { AppointmentWithRelations } from './useAppointments'

export function useWeekAppointments(date: Date) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
  const start = startOfDay(weekStart).toISOString()
  const end = endOfDay(weekEnd).toISOString()

  return useQuery({
    queryKey: ['appointments', 'weekly', format(weekStart, 'yyyy-MM-dd')],
    queryFn: async (): Promise<AppointmentWithRelations[]> => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients!patient_id ( id, first_name, last_name, phone ),
          doctor:profiles!doctor_id ( id, first_name, last_name, display_name, color )
        `)
        .gte('starts_at', start)
        .lte('starts_at', end)
        .neq('status', 'cancelled')
        .order('starts_at')

      if (error) throw error
      return (data ?? []) as unknown as AppointmentWithRelations[]
    },
    staleTime: 1000 * 30,
  })
}
