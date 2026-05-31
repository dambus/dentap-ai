import { useState } from 'react'
import { CalendarDays, LayoutGrid, RefreshCw, Plus } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useAppointments } from '../features/appointments/hooks/useAppointments'
import { useWeekAppointments } from '../features/appointments/hooks/useWeekAppointments'
import { useDoctors } from '../features/appointments/hooks/useDoctors'
import { DailyCalendar } from '../features/appointments/components/DailyCalendar'
import { WeeklyCalendar } from '../features/appointments/components/WeeklyCalendar'
import { DateNavigation } from '../features/appointments/components/DateNavigation'
import { WeekNavigation } from '../features/appointments/components/WeekNavigation'
import { DoctorFilter } from '../features/appointments/components/DoctorFilter'
import { NewAppointmentModal } from '../features/appointments/components/NewAppointmentModal'
import { AppointmentDetailsModal } from '../features/appointments/components/AppointmentDetailsModal'
import { Button, Spinner } from '../components/ui'
import { cn } from '../lib/utils'
import type { AppointmentWithRelations } from '../features/appointments/hooks/useAppointments'

type PlanerView = 'day' | 'week'

interface SlotClickData {
  date: Date
  doctorId: string
}

export function PlanerPage() {
  const [date, setDate] = useState<Date>(() => new Date())
  const [view, setView] = useState<PlanerView>('day')
  const [modalOpen, setModalOpen] = useState(false)
  const [slotData, setSlotData] = useState<SlotClickData | null>(null)
  const [detailsAppt, setDetailsAppt] = useState<AppointmentWithRelations | null>(null)
  const profile = useAuthStore((s) => s.profile)

  const { data: doctors = [], isLoading: loadingDoctors } = useDoctors()

  const [selectedDoctorIds, setSelectedDoctorIds] = useState<string[]>(() => {
    if (profile?.role === 'owner' || profile?.role === 'reception') return []
    return profile?.id ? [profile.id] : []
  })

  const effectiveDoctorIds = selectedDoctorIds.length > 0
    ? selectedDoctorIds
    : doctors.map((d) => d.id)

  const dailyQuery = useAppointments(date)
  const weeklyQuery = useWeekAppointments(date)

  const activeQuery = view === 'day' ? dailyQuery : weeklyQuery
  const isLoading = loadingDoctors || activeQuery.isLoading

  function handleSlotClick(slotDate: Date, doctorId: string) {
    setSlotData({ date: slotDate, doctorId })
    setModalOpen(true)
  }

  function handleAppointmentClick(appt: AppointmentWithRelations) {
    setDetailsAppt(appt)
  }

  function handleDayClick(day: Date) {
    setDate(day)
    setView('day')
  }

  function openNewModal() {
    setSlotData(null)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setSlotData(null)
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-wrap gap-y-2">
        {/* Leva strana: navigacija */}
        <div className="flex items-center gap-2">
          {view === 'day' ? (
            <DateNavigation date={date} onChange={setDate} />
          ) : (
            <WeekNavigation date={date} onChange={setDate} />
          )}
        </div>

        {/* Desna strana */}
        <div className="flex items-center gap-2 flex-wrap">
          <DoctorFilter
            doctors={doctors}
            selectedIds={effectiveDoctorIds}
            onChange={setSelectedDoctorIds}
          />

          {/* View toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-md p-0.5">
            <button
              onClick={() => setView('day')}
              title="Dnevni prikaz"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors',
                view === 'day'
                  ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              )}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dan</span>
            </button>
            <button
              onClick={() => setView('week')}
              title="Nedeljni prikaz"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors',
                view === 'week'
                  ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nedelja</span>
            </button>
          </div>

          <button
            onClick={() => activeQuery.refetch()}
            className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Osveži"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Button size="sm" onClick={openNewModal}>
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novi termin</span>
          </Button>
        </div>
      </div>

      {/* Sadržaj */}
      {isLoading ? (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" className="text-teal-600" />
          <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Učitavanje...</span>
        </div>
      ) : view === 'day' ? (
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <DailyCalendar
            date={date}
            appointments={dailyQuery.data ?? []}
            doctors={doctors}
            selectedDoctorIds={effectiveDoctorIds}
            onAppointmentClick={handleAppointmentClick}
            onSlotClick={handleSlotClick}
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-hidden">
          <WeeklyCalendar
            date={date}
            appointments={weeklyQuery.data ?? []}
            doctors={doctors}
            selectedDoctorIds={effectiveDoctorIds}
            onDayClick={handleDayClick}
            onAppointmentClick={handleAppointmentClick}
          />
        </div>
      )}

      <NewAppointmentModal
        open={modalOpen}
        onClose={closeModal}
        initialDate={slotData?.date}
        initialDoctorId={slotData?.doctorId}
      />

      <AppointmentDetailsModal
        appointment={detailsAppt}
        onClose={() => setDetailsAppt(null)}
      />
    </div>
  )
}
