import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { usePatient } from '../features/patients/hooks/usePatient'
import { PatientHeader } from '../features/patients/components/PatientHeader'
import { TabPregled } from '../features/patients/components/TabPregled'
import { TabAnamneza } from '../features/patients/components/TabAnamneza'
import { TabOdontogram } from '../features/patients/components/TabOdontogram'
import { TabPlanLecenja } from '../features/patients/components/TabPlanLecenja'
import { TabPosete } from '../features/patients/components/TabPosete'
import { Spinner } from '../components/ui'
import { cn } from '../lib/utils'

type PatientTab = 'pregled' | 'anamneza' | 'odontogram' | 'posete' | 'plan'

const TABS: { id: PatientTab; label: string }[] = [
  { id: 'pregled', label: 'Pregled' },
  { id: 'anamneza', label: 'Anamneza' },
  { id: 'odontogram', label: 'Odontogram' },
  { id: 'posete', label: 'Posete' },
  { id: 'plan', label: 'Plan lečenja' },
]

export function PacijentPage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState<PatientTab>('pregled')
  const { data: patient, isLoading } = usePatient(id ?? '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Spinner size="lg" className="text-teal-600" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
        Pacijent nije pronađen
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <PatientHeader patient={patient} />

      {/* Tab navigacija */}
      <div className="flex items-center gap-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              tab === t.id
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab sadržaj */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'pregled' && <TabPregled patientId={patient.id} />}
        {tab === 'anamneza' && (
          <TabAnamneza patientId={patient.id} clinicId={patient.clinic_id} />
        )}
        {tab === 'odontogram' && (
          <TabOdontogram patientId={patient.id} clinicId={patient.clinic_id} />
        )}
        {tab === 'posete' && <TabPosete patientId={patient.id} clinicId={patient.clinic_id} />}
        {tab === 'plan' && (
          <TabPlanLecenja patientId={patient.id} clinicId={patient.clinic_id} />
        )}
      </div>
    </div>
  )
}
