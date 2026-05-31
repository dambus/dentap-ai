import { useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useVisitProcedures, useCreateVisitProcedure } from '../hooks/useVisitProcedures'
import { ProcedureCard } from './ProcedureCard'
import { Card, Button, Input, Textarea, Spinner } from '../../../components/ui'
import type { VisitDetail } from '../hooks/useVisit'

interface TabProcedureProps {
  visit: VisitDetail
}

export function TabProcedure({ visit }: TabProcedureProps) {
  const profile = useAuthStore((s) => s.profile)
  const { data: procedures = [], isLoading } = useVisitProcedures(visit.id)
  const createProcedure = useCreateVisitProcedure()

  const [toothFdi, setToothFdi] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')

  async function handleAddProcedure() {
    if (!profile || !description.trim()) return
    try {
      await createProcedure.mutateAsync({
        clinic_id: visit.clinic_id,
        visit_id: visit.id,
        patient_id: visit.patient_id,
        doctor_id: visit.doctor_id,
        service_id: null,
        tooth_fdi: toothFdi || null,
        description: description.trim(),
        price: price ? parseInt(price) : null,
      })
      setToothFdi('')
      setDescription('')
      setPrice('')
    } catch (err) {
      console.error('Greška pri dodavanju procedure:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Spinner size="lg" className="text-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 max-w-3xl">
      {/* Lista procedura */}
      {procedures.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Procedure</h3>
          {procedures.map((proc) => (
            <ProcedureCard
              key={proc.id}
              procedure={proc as any}
            />
          ))}
        </div>
      )}

      {/* Forma za novu proceduru */}
      <Card header="Dodaj proceduru">
        <div className="space-y-3">
          <Textarea
            label="Procedura *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Npr. Plomba, Ekstrakcija, Čišćenje..."
            rows={2}
          />

          <Input
            label="Zub (FDI)"
            value={toothFdi}
            onChange={(e) => setToothFdi(e.target.value)}
            placeholder="npr. 16, 26, 36..."
          />

          <Input
            label="Cena (RSD)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
          />

          <Button
            onClick={handleAddProcedure}
            loading={createProcedure.isPending}
            disabled={!description.trim()}
            size="sm"
          >
            Dodaj proceduru
          </Button>
        </div>
      </Card>

      {procedures.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">
          Nema procedura. Dodaj prvu proceduru gore.
        </p>
      )}
    </div>
  )
}
