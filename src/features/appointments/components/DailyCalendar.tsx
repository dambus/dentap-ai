import { useEffect, useRef, useState } from 'react'
import { getHours, getMinutes, isToday } from 'date-fns'
import { cn } from '../../../lib/utils'
import { Spinner } from '../../../components/ui'
import { AppointmentCard } from './AppointmentCard'
import type { AppointmentWithRelations } from '../hooks/useAppointments'
import type { DoctorOption } from '../hooks/useDoctors'

interface DailyCalendarProps {
  date: Date
  appointments: AppointmentWithRelations[]
  doctors: DoctorOption[]
  selectedDoctorIds: string[]
  isLoading: boolean
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void
}

const HOUR_HEIGHT = 64 // px per hour
const START_HOUR = 7
const END_HOUR = 20
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR)
const DEFAULT_COLOR = '#0B6E6E'

function getAppointmentStyle(starts_at: string, ends_at: string): React.CSSProperties {
  const start = new Date(starts_at)
  const end = new Date(ends_at)
  const startMin = getHours(start) * 60 + getMinutes(start)
  const endMin = getHours(end) * 60 + getMinutes(end)
  const clampedStart = Math.max(startMin, START_HOUR * 60)
  const clampedEnd = Math.min(endMin, END_HOUR * 60)
  const top = ((clampedStart - START_HOUR * 60) / 60) * HOUR_HEIGHT
  const height = Math.max(((clampedEnd - clampedStart) / 60) * HOUR_HEIGHT, 24)
  return { position: 'absolute', top, height, left: 0, right: 0 }
}

function getCurrentTimeTop(): number {
  const now = new Date()
  const totalMin = getHours(now) * 60 + getMinutes(now)
  return ((totalMin - START_HOUR * 60) / 60) * HOUR_HEIGHT
}

export function DailyCalendar({
  date,
  appointments,
  doctors,
  selectedDoctorIds,
  isLoading,
  onAppointmentClick,
}: DailyCalendarProps) {
  const [nowTop, setNowTop] = useState(getCurrentTimeTop)
  const nowRef = useRef<HTMLDivElement>(null)

  const visibleDoctors = doctors.filter((d) => selectedDoctorIds.includes(d.id))

  // Ažuriraj indikator trenutnog vremena svakih 60s
  useEffect(() => {
    const id = setInterval(() => setNowTop(getCurrentTimeTop()), 60_000)
    return () => clearInterval(id)
  }, [])

  // Skroluj do trenutnog vremena pri montiranju
  useEffect(() => {
    nowRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [])

  const totalHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <Spinner size="lg" className="text-teal-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Vremenska osa — fiksirana levo */}
      <div className="w-14 shrink-0 relative" style={{ height: totalHeight }}>
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="absolute right-2 -translate-y-1/2 text-[11px] text-slate-400 dark:text-slate-500 font-mono select-none"
            style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}
          >
            {hour}:00
          </div>
        ))}
      </div>

      {/* Grid + kolone doktora */}
      <div className="flex-1 overflow-x-auto">
        <div
          className="relative flex"
          style={{
            height: totalHeight,
            minWidth: visibleDoctors.length * 180,
          }}
        >
          {/* Horizontalne linije — pune na sat, isprekidane na pola sata */}
          <div className="absolute inset-0 pointer-events-none">
            {HOURS.map((hour) => (
              <div key={hour}>
                {/* Puna linija na sat */}
                <div
                  className="absolute w-full border-t border-slate-100 dark:border-slate-700/60"
                  style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}
                />
                {/* Isprekidana linija na pola sata */}
                <div
                  className="absolute w-full border-t border-dashed border-slate-100 dark:border-slate-700/40"
                  style={{ top: (hour - START_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
                />
              </div>
            ))}
            {/* Krajnja linija */}
            <div
              className="absolute w-full border-t border-slate-100 dark:border-slate-700/60"
              style={{ top: totalHeight }}
            />
          </div>

          {/* Indikator trenutnog vremena */}
          {isToday(date) && nowTop >= 0 && nowTop <= totalHeight && (
            <div
              ref={nowRef}
              className="absolute w-full z-10 pointer-events-none flex items-center"
              style={{ top: nowTop }}
            >
              <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shrink-0" />
              <div className="flex-1 h-px bg-red-400 dark:bg-red-500" />
            </div>
          )}

          {/* Kolone po doktoru */}
          {visibleDoctors.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Nema izabranih doktora
              </p>
            </div>
          ) : (
            visibleDoctors.map((doctor, idx) => {
              const doctorAppointments = appointments.filter(
                (a) => a.doctor_id === doctor.id
              )
              const color = doctor.color ?? DEFAULT_COLOR

              return (
                <div
                  key={doctor.id}
                  className={cn(
                    'flex-1 relative',
                    idx > 0 && 'border-l border-slate-200 dark:border-slate-700'
                  )}
                  style={{ minWidth: 180 }}
                >
                  {/* Doctor header — sticky */}
                  <div
                    className="sticky top-0 z-20 px-2 py-1.5 text-xs font-semibold border-b text-center truncate"
                    style={{
                      backgroundColor: `${color}15`,
                      borderColor: `${color}30`,
                      color,
                    }}
                  >
                    {doctor.display_name ?? `${doctor.first_name} ${doctor.last_name}`}
                  </div>

                  {/* Termini */}
                  <div className="relative" style={{ height: totalHeight }}>
                    {doctorAppointments.length === 0 && (
                      <p className="text-[11px] text-slate-300 dark:text-slate-600 text-center mt-4 select-none">
                        Nema termina
                      </p>
                    )}
                    {doctorAppointments.map((appt) => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        style={getAppointmentStyle(appt.starts_at, appt.ends_at)}
                        onClick={onAppointmentClick}
                      />
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
