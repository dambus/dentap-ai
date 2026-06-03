import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Tables } from '../../../types'

export type ProfileRow = Tables<'profiles'>

export type UserRole = 'owner' | 'doctor' | 'specialist' | 'assistant' | 'reception' | 'inventory'

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Vlasnik',
  doctor: 'Doktor',
  specialist: 'Specijalista',
  assistant: 'Asistent',
  reception: 'Recepcija',
  inventory: 'Magacin',
}

export function useTeam(clinicId: string | null) {
  return useQuery({
    queryKey: ['team', clinicId],
    queryFn: async (): Promise<ProfileRow[]> => {
      if (!clinicId) return []
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('last_name')
      if (error) throw error
      return data ?? []
    },
    enabled: !!clinicId,
    staleTime: 1000 * 60,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      profileId,
      clinicId,
      data,
    }: {
      profileId: string
      clinicId: string
      data: Partial<Pick<ProfileRow, 'role' | 'is_active' | 'color' | 'specialty' | 'uza_specijalizacija' | 'broj_licence' | 'datum_licence' | 'datum_vazenja_licence' | 'status_licence'>>
    }) => {
      const updates: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() }
      if ('role' in data) {
        updates.is_doctor = ['doctor', 'specialist'].includes(data.role as string)
      }
      const { error } = await supabase.from('profiles').update(updates).eq('id', profileId)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team', variables.clinicId] })
    },
  })
}
