import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { usePatientMedicalRecord, useUpdateMedicalRecord } from '../hooks/usePatientMedicalRecord'
import { Card, Button, Textarea, TagsInput, Spinner } from '../../../components/ui'

interface TabAnamenzaProps {
  patientId: string
  clinicId: string
}

export function TabAnamneza({ patientId, clinicId }: TabAnamenzaProps) {
  const profile = useAuthStore((s) => s.profile)
  const { data: record, isLoading } = usePatientMedicalRecord(patientId)
  const updateRecord = useUpdateMedicalRecord()

  const [generalAnamnesis, setGeneralAnamnesis] = useState('')
  const [allergies, setAllergies] = useState<string[]>([])
  const [medications, setMedications] = useState<string[]>([])
  const [systemicDiseases, setSystemicDiseases] = useState<string[]>([])
  const [medicalAlerts, setMedicalAlerts] = useState('')
  const [dentalAnamnesis, setDentalAnamnesis] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (record) {
      setGeneralAnamnesis(record.general_anamnesis ?? '')
      setAllergies(record.allergies ?? [])
      setMedications(record.medications ?? [])
      setSystemicDiseases(record.systemic_diseases ?? [])
      setMedicalAlerts(record.medical_alerts ?? '')
      setDentalAnamnesis(record.dental_anamnesis ?? '')
    }
  }, [record])

  async function handleSave() {
    if (!profile) return
    setSaved(false)
    try {
      await updateRecord.mutateAsync({
        clinic_id: clinicId,
        patient_id: patientId,
        general_anamnesis: generalAnamnesis || null,
        allergies: allergies.length > 0 ? allergies : null,
        medications: medications.length > 0 ? medications : null,
        systemic_diseases: systemicDiseases.length > 0 ? systemicDiseases : null,
        medical_alerts: medicalAlerts || null,
        dental_anamnesis: dentalAnamnesis || null,
        updated_by: profile.id,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Greška pri čuvanju:', err)
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
      <Card>
        <Textarea
          label="Opšta anamneza"
          value={generalAnamnesis}
          onChange={(e) => setGeneralAnamnesis(e.target.value)}
          placeholder="Životne navike, istorija bolesti..."
          rows={3}
        />
      </Card>

      <Card>
        <TagsInput
          label="Alergije"
          tags={allergies}
          onTagsChange={setAllergies}
          placeholder="Dodaj alergiju... (Enter da potvrdiš)"
        />
      </Card>

      <Card>
        <TagsInput
          label="Tekući lekovi"
          tags={medications}
          onTagsChange={setMedications}
          placeholder="Dodaj lek... (Enter da potvrdiš)"
        />
      </Card>

      <Card>
        <TagsInput
          label="Sistemske bolesti"
          tags={systemicDiseases}
          onTagsChange={setSystemicDiseases}
          placeholder="Dodaj bolest... (Enter da potvrdiš)"
        />
      </Card>

      <Card>
        <Textarea
          label="Medicinska upozorenja"
          value={medicalAlerts}
          onChange={(e) => setMedicalAlerts(e.target.value)}
          placeholder="Važna medicinska upozorenja (prikazuje se crvenim bannerom)..."
          rows={2}
        />
      </Card>

      <Card>
        <Textarea
          label="Dentalna anamneza"
          value={dentalAnamnesis}
          onChange={(e) => setDentalAnamnesis(e.target.value)}
          placeholder="Istorija stomatološkog tretmana, fobije, prethodne intervencije..."
          rows={3}
        />
      </Card>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleSave}
          loading={updateRecord.isPending}
          disabled={saved}
        >
          {saved ? '✓ Sačuvano' : 'Sačuva'}
        </Button>
        {updateRecord.isError && (
          <span className="text-sm text-red-600 dark:text-red-400">Greška pri čuvanju</span>
        )}
      </div>
    </div>
  )
}
