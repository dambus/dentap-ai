import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Tables } from '../../../types'

export type OdontogramTooth = Tables<'odontogram_teeth'>

export type ToothStatus =
  | 'healthy'
  | 'decayed'
  | 'filled'
  | 'crowned'
  | 'missing'
  | 'implant'
  | 'bridge'
  | 'root_canal'
  | 'to_extract'
  | 'extracted'
  | 'other'

export const TOOTH_STATUS_LABELS: Record<ToothStatus, string> = {
  healthy: 'Zdrav',
  decayed: 'Karijes',
  filled: 'Plomba',
  crowned: 'Kruna',
  missing: 'Nedostaje',
  implant: 'Implantat',
  bridge: 'Most',
  root_canal: 'Devitalan',
  to_extract: 'Za vađenje',
  extracted: 'Izvađen',
  other: 'Ostalo',
}

export function useOdontogram(patientId: string) {
  return useQuery({
    queryKey: ['odontogram', patientId],
    queryFn: async (): Promise<OdontogramTooth[]> => {
      const { data, error } = await supabase
        .from('odontogram_teeth')
        .select('*')
        .eq('patient_id', patientId)

      if (error) throw error
      return data ?? []
    },
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5,
  })
}

interface UpsertToothParams {
  patientId: string
  clinicId: string
  toothFdi: string
  status: ToothStatus
  treatmentNote: string | null
  updatedBy: string
}

export function useUpsertTooth() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UpsertToothParams) => {
      const { error } = await supabase.from('odontogram_teeth').upsert(
        {
          patient_id: params.patientId,
          clinic_id: params.clinicId,
          tooth_fdi: params.toothFdi,
          status: params.status,
          treatment_note: params.treatmentNote,
          updated_by: params.updatedBy,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'patient_id,tooth_fdi' },
      )

      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['odontogram', variables.patientId] })
    },
  })
}
