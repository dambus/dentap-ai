import { useNavigate } from 'react-router-dom'
import { CheckCircle2, CalendarPlus, ArrowLeft, User } from 'lucide-react'
import { useCompleteVisit } from '../hooks/useVisit'
import { useVisitProcedures } from '../hooks/useVisitProcedures'
import { useAuthStore } from '../../../store/authStore'
import { useAgentStore } from '../../../store/agentStore'
import { Modal, Button, Badge } from '../../../components/ui'
import { formatDate } from '../../../lib/date'
import type { VisitDetail } from '../hooks/useVisit'

interface CompleteVisitModalProps {
  visit: VisitDetail & {
    patient?: { id: string; first_name: string; last_name: string }
  }
  isOpen: boolean
  onClose: () => void
}

export function CompleteVisitModal({ visit, isOpen, onClose }: CompleteVisitModalProps) {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const completeVisit = useCompleteVisit()
  const { data: procedures = [] } = useVisitProcedures(visit.id)
  const addAgentMessage = useAgentStore((s) => s.addMessage)

  const totalPrice = procedures.reduce((sum, p) => sum + (p.price ?? 0), 0)
  const isCompleted = visit.status === 'completed'

  async function handleConfirm() {
    if (!profile) return
    try {
      await completeVisit.mutateAsync({
        visitId: visit.id,
        appointmentId: visit.appointment_id ?? null,
        completedBy: profile.id,
      })
      // Proaktivni predlog: agent predlaže sledeći termin
      addAgentMessage({
        role: 'assistant',
        content:
          `Poseta je uspešno završena. ` +
          `Ako pacijentu treba kontrola ili nastavak lečenja, mogu zakazati sledeći termin — samo reci kad i kod koga.`,
      })
    } catch {
      // error handled by mutation
    }
  }

  if (isCompleted) {
    return (
      <Modal
        open={isOpen}
        onClose={onClose}
        title="Poseta završena"
        footer={
          <div className="flex flex-wrap gap-2 w-full">
            <Button
              variant="primary"
              onClick={() => {
                onClose()
                navigate('/planer')
              }}
            >
              <CalendarPlus className="w-4 h-4 mr-1.5" />
              Zakaži sledeći termin
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                onClose()
                if (visit.patient?.id) navigate(`/pacijenti/${visit.patient.id}`)
              }}
            >
              <User className="w-4 h-4 mr-1.5" />
              Ostani na kartonu
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                onClose()
                navigate('/planer')
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Nazad na planer
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center py-4 gap-3">
          <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              Poseta je uspešno završena
            </p>
            {visit.patient && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {visit.patient.last_name} {visit.patient.first_name} —{' '}
                {formatDate(visit.visit_date)}
              </p>
            )}
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Završi posetu"
      description="Pregled unete dokumentacije pre zatvaranja posete"
      footer={
        <div className="flex gap-2 justify-end w-full">
          <Button variant="ghost" onClick={onClose} disabled={completeVisit.isPending}>
            Otkaži
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            loading={completeVisit.isPending}
          >
            Potvrdi i završi
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Kliničke napomene */}
        <ReviewSection title="Razlog posete">
          {visit.chief_complaint ? (
            <p className="text-sm text-slate-700 dark:text-slate-300">{visit.chief_complaint}</p>
          ) : (
            <p className="text-sm text-slate-400 italic">Nije uneseno</p>
          )}
        </ReviewSection>

        <ReviewSection title="Dijagnoza">
          {visit.diagnosis ? (
            <p className="text-sm text-slate-700 dark:text-slate-300">{visit.diagnosis}</p>
          ) : (
            <p className="text-sm text-slate-400 italic">Nije unesena</p>
          )}
        </ReviewSection>

        <ReviewSection title="Kliničke napomene">
          {visit.clinical_notes ? (
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {visit.clinical_notes}
            </p>
          ) : (
            <p className="text-sm text-slate-400 italic">Nisu unesene</p>
          )}
        </ReviewSection>

        {/* Procedure */}
        <ReviewSection title={`Urađene procedure (${procedures.length})`}>
          {procedures.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Nema procedura</p>
          ) : (
            <div className="space-y-1.5">
              {procedures.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {p.description}
                    {p.tooth_fdi && (
                      <span className="ml-1 text-xs text-slate-400 font-mono">(zub {p.tooth_fdi})</span>
                    )}
                  </span>
                  {p.price != null && (
                    <span className="text-sm font-mono text-slate-500 dark:text-slate-400 shrink-0">
                      {p.price.toLocaleString('sr-RS')} RSD
                    </span>
                  )}
                </div>
              ))}
              {totalPrice > 0 && (
                <div className="flex justify-end pt-1.5 border-t border-slate-100 dark:border-slate-700 mt-2">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Ukupno: {totalPrice.toLocaleString('sr-RS')} RSD
                  </span>
                </div>
              )}
            </div>
          )}
        </ReviewSection>

        {completeVisit.isError && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Greška pri završavanju posete. Pokušaj ponovo.
          </p>
        )}
      </div>
    </Modal>
  )
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
        {title}
      </p>
      {children}
    </div>
  )
}
