import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Stethoscope, CheckCircle2, ArrowLeft, Trash2, AlertTriangle } from 'lucide-react'
import { Badge, Button, VisitStatusBadge } from '../../../components/ui'
import { CompleteVisitModal } from './CompleteVisitModal'
import { useDeleteVisit } from '../hooks/useVisit'
import { isVisitStale } from '../hooks/useStaleVisits'
import { formatDateTime, formatDate } from '../../../lib/date'
import type { VisitDetail } from '../hooks/useVisit'

interface VisitHeaderProps {
  visit: VisitDetail & {
    patient?: { id: string; first_name: string; last_name: string; phone: string | null }
    doctor?: { first_name: string; last_name: string; display_name: string | null }
  }
}

export function VisitHeader({ visit }: VisitHeaderProps) {
  const navigate = useNavigate()
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const deleteVisit = useDeleteVisit()
  const isDraft = visit.status === 'draft'
  const isStale = isDraft && isVisitStale(visit.visit_date)

  async function handleDelete() {
    setDeleteError(null)
    try {
      await deleteVisit.mutateAsync(visit.id)
      if (visit.patient?.id) {
        navigate(`/pacijenti/${visit.patient.id}`, { replace: true })
      } else {
        navigate('/planer', { replace: true })
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Greška pri brisanju.')
      setConfirmDelete(false)
    }
  }

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

        {isStale && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Poseta od <strong>{formatDate(visit.visit_date)}</strong> nije završena.
              Unesite nalaz i kliknite „Završi posetu".
            </p>
          </div>
        )}

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Poseta —{' '}
              {visit.patient?.id ? (
                <Link
                  to={`/pacijenti/${visit.patient.id}`}
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  {visit.patient.last_name} {visit.patient.first_name}
                </Link>
              ) : (
                'N/A'
              )}
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

          <div className="flex items-center gap-2">
            <VisitStatusBadge status={visit.status as 'draft' | 'completed'} />

            {isDraft && (
              <>
                {deleteError && (
                  <span className="text-xs text-red-600 dark:text-red-400">{deleteError}</span>
                )}

                {confirmDelete ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <span className="text-xs text-red-700 dark:text-red-300">Obrisati posetу?</span>
                    <button
                      onClick={handleDelete}
                      disabled={deleteVisit.isPending}
                      className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                    >
                      {deleteVisit.isPending ? 'Brišem...' : 'Obriši'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                      Otkaži
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Obriši posetу"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCompleteModal(true)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Završi posetu
                </Button>
              </>
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
