import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Stethoscope, Plus } from 'lucide-react'
import { useVisitsForPatient } from '../hooks/useVisitsForPatient'
import { useCreateVisit, todayDateString } from '../../visits/hooks/useCreateVisit'
import { useAuthStore } from '../../../store/authStore'
import { Badge, Spinner, Button, VisitStatusBadge } from '../../../components/ui'
import { formatDate } from '../../../lib/date'

interface TabPoseteProps {
  patientId: string
  clinicId: string
}

export function TabPosete({ patientId, clinicId }: TabPoseteProps) {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { data: visits = [], isLoading } = useVisitsForPatient(patientId)
  const createVisit = useCreateVisit()

  async function handleNewVisit() {
    if (!profile) return
    try {
      const visit = await createVisit.mutateAsync({
        clinic_id: clinicId,
        patient_id: patientId,
        doctor_id: profile.id,
        appointment_id: null,
        visit_date: todayDateString(),
        created_by: profile.id,
      })
      navigate(`/posete/${visit.id}`)
    } catch {
      // error state iz mutation
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" className="text-teal-600" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          Istorija poseta
        </h2>
        <Button size="sm" onClick={handleNewVisit} loading={createVisit.isPending}>
          <Plus className="w-4 h-4 mr-1" />
          Nova poseta
        </Button>
      </div>

      {visits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400 gap-2">
          <Stethoscope className="w-8 h-8 opacity-30" />
          <p className="text-sm">Nema evidentiranih poseta</p>
        </div>
      ) : (
        visits.map((visit) => {
          const doctorName =
            visit.doctor?.display_name ??
            (visit.doctor
              ? `${visit.doctor.first_name} ${visit.doctor.last_name}`
              : 'N/A')

          return (
            <Link
              key={visit.id}
              to={`/posete/${visit.id}`}
              className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-sm transition-all group"
            >
              {/* Datum */}
              <div className="shrink-0 text-center w-12">
                <p className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100 leading-none">
                  {formatDate(visit.visit_date).split('.')[0]}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {formatDate(visit.visit_date).split('.').slice(1, 3).join('.')}
                </p>
              </div>

              <div className="w-px self-stretch bg-slate-100 dark:bg-slate-700 shrink-0" />

              {/* Sadržaj */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <VisitStatusBadge status={visit.status as 'draft' | 'completed'} />
                  <span className="text-xs text-slate-500 dark:text-slate-400">{doctorName}</span>
                </div>
                {visit.chief_complaint && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                    {visit.chief_complaint}
                  </p>
                )}
                {visit.diagnosis && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {visit.diagnosis}
                  </p>
                )}
              </div>

              {/* Procedure count + arrow */}
              <div className="shrink-0 flex items-center gap-2">
                {visit.procedure_count > 0 && (
                  <Badge variant="neutral">
                    {visit.procedure_count}{' '}
                    {visit.procedure_count === 1 ? 'procedura' : 'procedure'}
                  </Badge>
                )}
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-teal-500 transition-colors" />
              </div>
            </Link>
          )
        })
      )}
    </div>
  )
}
