import { Calendar, FileText, ClipboardList } from 'lucide-react'
import { Card, Spinner, Badge } from '../../../components/ui'
import { formatDateTime, formatDate } from '../../../lib/date'
import { usePatientNextAppointment, usePatientLastVisit, usePatientActivePlan } from '../hooks/usePatientOverview'

interface TabPregledProps {
  patientId: string
}

export function TabPregled({ patientId }: TabPregledProps) {
  const { data: nextAppt, isLoading: loadingAppt } = usePatientNextAppointment(patientId)
  const { data: lastVisit, isLoading: loadingVisit } = usePatientLastVisit(patientId)
  const { data: activePlan, isLoading: loadingPlan } = usePatientActivePlan(patientId)

  return (
    <div className="space-y-4 p-4">
      {/* Sledeći termin */}
      <Card header="Sledeći termin">
        {loadingAppt ? (
          <Spinner size="sm" />
        ) : nextAppt ? (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="font-semibold">{formatDateTime(nextAppt.starts_at)}</span>
            </div>
            {nextAppt.doctor && (
              <p className="text-slate-600 dark:text-slate-400">
                Dr. {nextAppt.doctor.display_name ?? `${nextAppt.doctor.first_name} ${nextAppt.doctor.last_name}`}
              </p>
            )}
            {nextAppt.appointment_type && (
              <Badge variant="info" className="text-xs">{nextAppt.appointment_type}</Badge>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nema zakazanih termina</p>
        )}
      </Card>

      {/* Poslednja poseta */}
      <Card header="Poslednja poseta">
        {loadingVisit ? (
          <Spinner size="sm" />
        ) : lastVisit ? (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="font-semibold">{formatDate(lastVisit.visit_date)}</span>
            </div>
            {lastVisit.chief_complaint && (
              <p className="text-slate-600 dark:text-slate-400">
                <span className="font-medium">Razlog:</span> {lastVisit.chief_complaint}
              </p>
            )}
            {lastVisit.diagnosis && (
              <p className="text-slate-600 dark:text-slate-400">
                <span className="font-medium">Dijagnoza:</span> {lastVisit.diagnosis}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nema završenih poseta</p>
        )}
      </Card>

      {/* Aktivni plan lečenja */}
      <Card header="Aktivni plan lečenja">
        {loadingPlan ? (
          <Spinner size="sm" />
        ) : activePlan ? (
          <div className="space-y-3 text-sm">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              {activePlan.title}
            </h3>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-slate-400" />
              <Badge variant={activePlan.status === 'accepted' ? 'success' : 'warning'}>
                {activePlan.status}
              </Badge>
            </div>
            {activePlan.estimated_total && (
              <p className="text-slate-600 dark:text-slate-400">
                Procenjena cena: <span className="font-semibold">{activePlan.estimated_total} RSD</span>
              </p>
            )}
            {activePlan.items && (
              <p className="text-slate-600 dark:text-slate-400">
                Stavki: {activePlan.items.length}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nema aktivnih planova</p>
        )}
      </Card>
    </div>
  )
}
