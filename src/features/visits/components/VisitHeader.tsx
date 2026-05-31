import { Calendar, Stethoscope } from 'lucide-react'
import { Badge, VisitStatusBadge } from '../../../components/ui'
import { formatDateTime } from '../../../lib/date'
import type { VisitDetail } from '../hooks/useVisit'

interface VisitHeaderProps {
  visit: VisitDetail & {
    patient?: { first_name: string; last_name: string; phone: string | null }
    doctor?: { first_name: string; last_name: string; display_name: string | null }
  }
}

export function VisitHeader({ visit }: VisitHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Poseta — {visit.patient ? `${visit.patient.last_name} ${visit.patient.first_name}` : 'N/A'}
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDateTime(visit.visit_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              <span>
                {visit.doctor?.display_name ?? `${visit.doctor?.first_name} ${visit.doctor?.last_name}`}
              </span>
            </div>
            {visit.diagnosis && (
              <div className="flex items-center gap-2">
                <Badge variant="info">{visit.diagnosis}</Badge>
              </div>
            )}
          </div>
        </div>
        <VisitStatusBadge status={visit.status as 'draft' | 'completed'} />
      </div>
    </div>
  )
}
