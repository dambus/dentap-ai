import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Stethoscope, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Badge, Button, VisitStatusBadge } from '../../../components/ui'
import { CompleteVisitModal } from './CompleteVisitModal'
import { formatDateTime } from '../../../lib/date'
import type { VisitDetail } from '../hooks/useVisit'

interface VisitHeaderProps {
  visit: VisitDetail & {
    patient?: { id: string; first_name: string; last_name: string; phone: string | null }
    doctor?: { first_name: string; last_name: string; display_name: string | null }
  }
}

export function VisitHeader({ visit }: VisitHeaderProps) {
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const isDraft = visit.status === 'draft'

  return (
    <>
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 pt-3 pb-4">
        {visit.patient?.id && (
          <Link
            to={`/pacijenti/${visit.patient.id}`}
            className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors mb-3"
          >
            <ArrowLeft className="w-3 h-3" />
            {visit.patient.last_name} {visit.patient.first_name}
          </Link>
        )}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Poseta —{' '}
              {visit.patient
                ? `${visit.patient.last_name} ${visit.patient.first_name}`
                : 'N/A'}
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDateTime(visit.visit_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                <span>
                  {visit.doctor?.display_name ??
                    `${visit.doctor?.first_name} ${visit.doctor?.last_name}`}
                </span>
              </div>
              {visit.diagnosis && (
                <div className="flex items-center gap-2">
                  <Badge variant="info">{visit.diagnosis}</Badge>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <VisitStatusBadge status={visit.status as 'draft' | 'completed'} />
            {isDraft && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCompleteModal(true)}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Završi posetu
              </Button>
            )}
          </div>
        </div>
      </div>

      <CompleteVisitModal
        visit={visit}
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
      />
    </>
  )
}
