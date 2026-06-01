import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useUpdateVisit } from '../hooks/useVisit'
import { Card, Button, Textarea } from '../../../components/ui'
import type { VisitDetail } from '../hooks/useVisit'

interface TabPregledProps {
  visit: VisitDetail
}

export function TabPregled({ visit }: TabPregledProps) {
  const profile = useAuthStore((s) => s.profile)
  const updateVisit = useUpdateVisit()
  const isReadOnly = visit.status === 'completed'

  const [chiefComplaint, setChiefComplaint] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [clinicalNotes, setClinicalNotes] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setChiefComplaint(visit.chief_complaint ?? '')
    setDiagnosis(visit.diagnosis ?? '')
    setClinicalNotes(visit.clinical_notes ?? '')
  }, [visit])

  async function handleSave() {
    if (!profile || isReadOnly) return
    setSaved(false)
    try {
      await updateVisit.mutateAsync({
        visitId: visit.id,
        data: {
          chief_complaint: chiefComplaint || null,
          diagnosis: diagnosis || null,
          clinical_notes: clinicalNotes || null,
        },
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // error state iz mutation
    }
  }

  return (
    <div className="space-y-4 p-4 max-w-3xl">
      {isReadOnly && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
          <span>Poseta je završena — sadržaj je zaključan za izmene.</span>
        </div>
      )}

      <Card>
        <Textarea
          label="Razlog posete"
          value={chiefComplaint}
          onChange={(e) => setChiefComplaint(e.target.value)}
          placeholder="Šta je pacijenta dovelo..."
          rows={2}
          disabled={isReadOnly}
        />
      </Card>

      <Card>
        <Textarea
          label="Dijagnoza"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          placeholder="Stomatološka dijagnoza..."
          rows={2}
          disabled={isReadOnly}
        />
      </Card>

      <Card>
        <Textarea
          label="Kliničke napomene"
          value={clinicalNotes}
          onChange={(e) => setClinicalNotes(e.target.value)}
          placeholder="Dodatne napomene o tretmanu..."
          rows={3}
          disabled={isReadOnly}
        />
      </Card>

      {!isReadOnly && (
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} loading={updateVisit.isPending} disabled={saved}>
            {saved ? '✓ Sačuvano' : 'Sačuvaj'}
          </Button>
          {updateVisit.isError && (
            <span className="text-sm text-red-600 dark:text-red-400">Greška pri čuvanju</span>
          )}
        </div>
      )}
    </div>
  )
}
