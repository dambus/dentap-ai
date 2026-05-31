import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Phone, Clock, User, AlertTriangle, ChevronRight,
  UserCheck, Armchair, Play, Ban, UserX, Stethoscope,
} from 'lucide-react'
import { useAuthStore } from '../../../store/authStore'
import { useUpdateAppointmentStatus } from '../hooks/useUpdateAppointmentStatus'
import { usePatientAlerts } from '../hooks/usePatientAlerts'
import { useCreateVisit, todayDateString } from '../../visits/hooks/useCreateVisit'
import { Modal, Button, Badge, ArrivalStatusBadge, AppointmentStatusBadge, Textarea } from '../../../components/ui'
import { formatDateTime, formatTime } from '../../../lib/date'
import { cn } from '../../../lib/utils'
import type { AppointmentWithRelations } from '../hooks/useAppointments'

interface AppointmentDetailsModalProps {
  appointment: AppointmentWithRelations | null
  onClose: () => void
}

const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  regular: 'Redovan pregled',
  urgent: 'Hitan slučaj',
  followup: 'Kontrola',
  consultation: 'Konsultacija',
  specialist: 'Specijalista',
}

export function AppointmentDetailsModal({ appointment, onClose }: AppointmentDetailsModalProps) {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const updateStatus = useUpdateAppointmentStatus()
  const createVisit = useCreateVisit()
  const [cancelMode, setCancelMode] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: alerts } = usePatientAlerts(appointment?.patient_id ?? null)

  const open = !!appointment
  const appt = appointment

  function reset() {
    setCancelMode(false)
    setCancelReason('')
    setActionError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleArrived() {
    if (!appt) return
    setActionError(null)
    try {
      await updateStatus.mutateAsync({ id: appt.id, updates: { arrival_status: 'arrived' } })
      handleClose()
    } catch { setActionError('Greška pri ažuriranju statusa.') }
  }

  async function handleInChair() {
    if (!appt) return
    setActionError(null)
    try {
      await updateStatus.mutateAsync({ id: appt.id, updates: { arrival_status: 'in_chair' } })
      handleClose()
    } catch { setActionError('Greška pri ažuriranju statusa.') }
  }

  async function handleStartVisit() {
    if (!appt || !profile) return
    setActionError(null)
    try {
      const visit = await createVisit.mutateAsync({
        clinic_id: appt.clinic_id,
        patient_id: appt.patient_id,
        doctor_id: appt.doctor_id,
        appointment_id: appt.id,
        visit_date: todayDateString(),
        created_by: profile.id,
      })
      await updateStatus.mutateAsync({
        id: appt.id,
        updates: { arrival_status: 'in_chair' },
      })
      handleClose()
      navigate(`/posete/${visit.id}`)
    } catch { setActionError('Greška pri kreiranju posete.') }
  }

  async function handleNoShow() {
    if (!appt) return
    setActionError(null)
    try {
      await updateStatus.mutateAsync({
        id: appt.id,
        updates: { status: 'no_show', arrival_status: 'not_arrived' },
      })
      handleClose()
    } catch { setActionError('Greška pri ažuriranju statusa.') }
  }

  async function handleCancel() {
    if (!appt || !profile) return
    setActionError(null)
    try {
      await updateStatus.mutateAsync({
        id: appt.id,
        updates: {
          status: 'cancelled',
          cancellation_reason: cancelReason.trim() || undefined,
          cancelled_by: profile.id,
        },
      })
      handleClose()
    } catch { setActionError('Greška pri otkazivanju.') }
  }

  const isPending = updateStatus.isPending || createVisit.isPending
  const arrivalStatus = appt?.arrival_status ?? 'not_arrived'
  const apptStatus = appt?.status ?? 'scheduled'
  const isCancelledOrNoShow = apptStatus === 'cancelled' || apptStatus === 'no_show'

  const hasAlerts = !!(alerts?.medical_alerts || (alerts?.allergies && alerts.allergies.length > 0))

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="sm"
      title={appt?.patient
        ? `${appt.patient.last_name} ${appt.patient.first_name}`
        : 'Termin'}
      footer={
        cancelMode ? (
          <div className="w-full space-y-3">
            <Textarea
              label="Razlog otkazivanja (opciono)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={2}
              placeholder="Unesite razlog..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setCancelMode(false)} disabled={isPending}>
                Nazad
              </Button>
              <Button variant="danger" size="sm" loading={isPending} onClick={handleCancel}>
                Potvrdi otkazivanje
              </Button>
            </div>
          </div>
        ) : isCancelledOrNoShow ? undefined : (
          <ActionButtons
            arrivalStatus={arrivalStatus}
            onArrived={handleArrived}
            onInChair={handleInChair}
            onStartVisit={handleStartVisit}
            onNoShow={handleNoShow}
            onCancel={() => setCancelMode(true)}
            isPending={isPending}
            visitId={undefined}
          />
        )
      }
    >
      {appt && (
        <div className="space-y-4">
          {/* Medicinska upozorenja */}
          {hasAlerts && (
            <div className="flex gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 dark:text-red-300 space-y-0.5">
                {alerts?.medical_alerts && <p className="font-semibold">{alerts.medical_alerts}</p>}
                {alerts?.allergies && alerts.allergies.length > 0 && (
                  <p>Alergije: {alerts.allergies.join(', ')}</p>
                )}
              </div>
            </div>
          )}

          {/* Detalji termina */}
          <div className="space-y-2.5">
            <DetailRow icon={<Clock className="w-4 h-4" />}>
              <span className="font-medium">{formatDateTime(appt.starts_at)}</span>
              <span className="text-slate-400 dark:text-slate-500 mx-1">–</span>
              <span>{formatTime(appt.ends_at)}</span>
              <span className="ml-1 text-slate-500 dark:text-slate-400">
                ({appt.duration_min} min)
              </span>
            </DetailRow>

            <DetailRow icon={<User className="w-4 h-4" />}>
              <span>{appt.doctor?.display_name ?? `${appt.doctor?.first_name} ${appt.doctor?.last_name}`}</span>
            </DetailRow>

            {appt.patient?.phone && (
              <DetailRow icon={<Phone className="w-4 h-4" />}>
                <a
                  href={`tel:${appt.patient.phone}`}
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  {appt.patient.phone}
                </a>
              </DetailRow>
            )}

            <DetailRow icon={<Stethoscope className="w-4 h-4" />}>
              <span>{APPOINTMENT_TYPE_LABELS[appt.appointment_type ?? 'regular'] ?? appt.appointment_type}</span>
            </DetailRow>
          </div>

          {/* Status */}
          <div className="flex flex-wrap items-center gap-2">
            <AppointmentStatusBadge status={appt.status as 'scheduled' | 'completed' | 'cancelled' | 'no_show'} />
            {!isCancelledOrNoShow && (
              <ArrivalStatusBadge status={appt.arrival_status as 'not_arrived' | 'arrived' | 'in_chair' | 'completed'} />
            )}
          </div>

          {/* Napomena */}
          {appt.notes && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Napomena</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{appt.notes}</p>
            </div>
          )}

          {/* Razlog otkazivanja */}
          {isCancelledOrNoShow && appt.cancellation_reason && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Razlog</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{appt.cancellation_reason}</p>
            </div>
          )}

          {actionError && (
            <p className="text-xs text-red-600 dark:text-red-400">{actionError}</p>
          )}
        </div>
      )}
    </Modal>
  )
}

// --- Helper komponente ---

function DetailRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
      <span className="text-slate-400 dark:text-slate-500 mt-0.5 shrink-0">{icon}</span>
      <span className="flex items-center flex-wrap gap-1">{children}</span>
    </div>
  )
}

interface ActionButtonsProps {
  arrivalStatus: string
  onArrived: () => void
  onInChair: () => void
  onStartVisit: () => void
  onNoShow: () => void
  onCancel: () => void
  isPending: boolean
  visitId: string | undefined
}

function ActionButtons({
  arrivalStatus, onArrived, onInChair, onStartVisit, onNoShow, onCancel, isPending,
}: ActionButtonsProps) {
  return (
    <div className={cn('flex items-center gap-2 w-full', 'flex-wrap justify-between sm:flex-nowrap')}>
      {/* Sekundarne akcije */}
      <div className="flex gap-2">
        {arrivalStatus !== 'completed' && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onNoShow}
              disabled={isPending}
              className="text-slate-500 dark:text-slate-400"
            >
              <UserX className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nije došao</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={onCancel}
              disabled={isPending}
            >
              <Ban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Otkaži</span>
            </Button>
          </>
        )}
      </div>

      {/* Primarna akcija */}
      <div className="ml-auto">
        {arrivalStatus === 'not_arrived' && (
          <Button size="sm" loading={isPending} onClick={onArrived}>
            <UserCheck className="w-3.5 h-3.5" />
            Pacijent stigao
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        )}
        {arrivalStatus === 'arrived' && (
          <Button size="sm" loading={isPending} onClick={onInChair}>
            <Armchair className="w-3.5 h-3.5" />
            Uvesti pacijenta
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        )}
        {arrivalStatus === 'in_chair' && (
          <Button size="sm" loading={isPending} onClick={onStartVisit}>
            <Play className="w-3.5 h-3.5" />
            Počni posetу
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        )}
        {arrivalStatus === 'completed' && (
          <Badge variant="success">Poseta završena</Badge>
        )}
      </div>
    </div>
  )
}
