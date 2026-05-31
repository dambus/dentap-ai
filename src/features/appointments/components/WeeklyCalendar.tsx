import { startOfWeek, addDays, isSameDay, isToday, format } from 'date-fns'
import { sr } from 'date-fns/locale'
import { cn } from '../../../lib/utils'
import { formatTime } from '../../../lib/date'
import type { AppointmentWithRelations } from '../hooks/useAppointments'
import type { DoctorOption } from '../hooks/useDoctors'

interface WeeklyCalendarProps {
  date: Date
  appointments: AppointmentWithRelations[]
  doctors: DoctorOption[]
  selectedDoctorIds: string[]
  onDayClick: (day: Date) => void
  onAppointmentClick?: (appt: AppointmentWithRelations) => void
}

const DEFAULT_COLOR = '#0B6E6E'

const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  regular: 'Redovan',
  urgent: 'Hitan',
  followup: 'Kontrola',
  consultation: 'Konsultacija',
  specialist: 'Specijalista',
}

function WeekAppointmentCard({
  appt,
  onClick,
}: {
  appt: AppointmentWithRelations
  onClick?: (appt: AppointmentWithRelations) => void
}) {
  const color = appt.doctor?.color ?? DEFAULT_COLOR
  const isUrgent = appt.appointment_type === 'urgent'

  return (
    <button
      onClick={() => onClick?.(appt)}
      className={cn(
        'w-full text-left px-2 py-1.5 rounded-md text-xs border-l-2 transition-shadow hover:shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500',
        isUrgent && 'ring-1 ring-red-400'
      )}
      style={{
        backgroundColor: `${color}15`,
        borderLeftColor: color,
      }}
    >
      <div className="flex items-center gap-1 flex-wrap">
        <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0 font-mono text-[10px]">
          {formatTime(appt.starts_at)}
        </span>
        {isUrgent && (
          <span className="text-[9px] font-bold text-red-500 uppercase">!</span>
        )}
      </div>
      {appt.patient && (
        <p className="font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
          {appt.patient.last_name} {appt.patient.first_name.charAt(0)}.
        </p>
      )}
      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
        {appt.doctor?.display_name ?? `${appt.doctor?.first_name}`}
        {appt.appointment_type && appt.appointment_type !== 'regular' && (
          <> · {APPOINTMENT_TYPE_LABELS[appt.appointment_type]}</>
        )}
      </p>
    </button>
  )
}

export function WeeklyCalendar({
  date,
  appointments,
  selectedDoctorIds,
  onDayClick,
  onAppointmentClick,
}: WeeklyCalendarProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const filteredAppointments = appointments.filter((a) =>
    selectedDoctorIds.includes(a.doctor_id)
  )

  function getAppointmentsForDay(day: Date) {
    return filteredAppointments
      .filter((a) => isSameDay(new Date(a.starts_at), day))
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
  }

  return (
    <div className="flex flex-1 overflow-x-auto h-full">
      {weekDays.map((day, idx) => {
        const dayAppointments = getAppointmentsForDay(day)
        const today = isToday(day)
        const dayName = format(day, 'EEE', { locale: sr })
        const dayNum = format(day, 'd', { locale: sr })
        const monthLabel = format(day, 'MMM', { locale: sr })
        const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1)

        return (
          <div
            key={day.toISOString()}
            className={cn(
              'flex flex-col flex-1 min-w-36 border-r border-slate-200 dark:border-slate-700 last:border-r-0',
              today && 'bg-teal-50/30 dark:bg-teal-900/10'
            )}
          >
            {/* Header dana */}
            <button
              onClick={() => onDayClick(day)}
              className={cn(
                'sticky top-0 z-10 w-full py-2.5 px-2 border-b flex flex-col items-center gap-0.5 transition-colors',
                today
                  ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
              )}
            >
              <span
                className={cn(
                  'text-[11px] font-medium uppercase tracking-wide',
                  today
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-slate-400 dark:text-slate-500'
                )}
              >
                {capitalizedDay}
              </span>
              <span
                className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold',
                  today
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-700 dark:text-slate-200'
                )}
              >
                {dayNum}
              </span>
              {idx === 0 || format(day, 'd') === '1' ? (
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
                </span>
              ) : null}
              {dayAppointments.length > 0 && (
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    today ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'
                  )}
                >
                  {dayAppointments.length} term.
                </span>
              )}
            </button>

            {/* Termini */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
              {dayAppointments.length === 0 ? (
                <p className="text-[11px] text-slate-300 dark:text-slate-600 text-center mt-3 select-none">
                  Nema termina
                </p>
              ) : (
                dayAppointments.map((appt) => (
                  <WeekAppointmentCard
                    key={appt.id}
                    appt={appt}
                    onClick={onAppointmentClick}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
