import { cn } from '../../../lib/utils'
import { formatTime } from '../../../lib/date'
import { ArrivalStatusBadge } from '../../../components/ui'
import type { AppointmentWithRelations } from '../hooks/useAppointments'

interface AppointmentCardProps {
  appointment: AppointmentWithRelations
  style: React.CSSProperties
  onClick?: (appointment: AppointmentWithRelations) => void
}

const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  regular: 'Redovan',
  urgent: 'Hitan',
  followup: 'Kontrola',
  consultation: 'Konsultacija',
  specialist: 'Specijalista',
}

const DEFAULT_COLOR = '#0B6E6E'

export function AppointmentCard({ appointment, style, onClick }: AppointmentCardProps) {
  const color = appointment.doctor?.color ?? DEFAULT_COLOR
  const patient = appointment.patient
  const durationMin = appointment.duration_min ?? 30
  const isTiny = durationMin <= 15            // ≤15 min: samo vreme
  const isShort = durationMin <= 30           // ≤30 min: vreme + kompaktni red
  const isLong = durationMin > 30             // >30 min: sva 3 reda odvojeno

  const typeLabel =
    APPOINTMENT_TYPE_LABELS[appointment.appointment_type ?? 'regular'] ??
    appointment.appointment_type

  const patientName = patient
    ? `${patient.last_name} ${patient.first_name}`
    : null

  return (
    <button
      onClick={() => onClick?.(appointment)}
      className={cn(
        'absolute left-1 right-1 rounded-md overflow-hidden text-left',
        'border-l-[3px] transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500',
        appointment.arrival_status === 'in_chair' && 'ring-1 ring-amber-400',
        appointment.arrival_status === 'completed' && 'opacity-60'
      )}
      style={{
        ...style,
        backgroundColor: `${color}18`,
        borderLeftColor: color,
      }}
    >
      <div className="px-1.5 py-1 h-full flex flex-col overflow-hidden">
        {/* Vreme */}
        <span className="text-[10px] font-semibold leading-none text-slate-500 dark:text-slate-400 shrink-0">
          {formatTime(appointment.starts_at)}
          {isLong && ` – ${formatTime(appointment.ends_at)}`}
        </span>

        {/* ≤15 min: nema više mesta */}
        {isTiny ? null : isShort ? (
          /* 16–30 min: ime + tip na jednom redu */
          <span className="text-[10px] font-medium leading-tight text-slate-700 dark:text-slate-200 truncate mt-0.5">
            {patientName
              ? `${patientName} · ${typeLabel}`
              : typeLabel}
          </span>
        ) : (
          /* >30 min: ime i tip odvojeno */
          <>
            <span className="text-xs font-semibold leading-tight text-slate-800 dark:text-slate-100 truncate mt-0.5">
              {patientName ?? '–'}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {typeLabel}
              </span>
              {appointment.arrival_status && appointment.arrival_status !== 'not_arrived' && (
                <ArrivalStatusBadge status={appointment.arrival_status as 'arrived' | 'in_chair' | 'completed'} />
              )}
            </div>
          </>
        )}
      </div>
    </button>
  )
}
