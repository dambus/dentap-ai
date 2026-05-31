import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useAppointments } from '../features/appointments/hooks/useAppointments'
import { useDoctors } from '../features/appointments/hooks/useDoctors'
import { DailyCalendar } from '../features/appointments/components/DailyCalendar'
import { DateNavigation } from '../features/appointments/components/DateNavigation'
import { DoctorFilter } from '../features/appointments/components/DoctorFilter'
import { Spinner } from '../components/ui'

export function PlanerPage() {
  const [date, setDate] = useState<Date>(() => new Date())
  const profile = useAuthStore((s) => s.profile)

  const { data: doctors = [], isLoading: loadingDoctors } = useDoctors()

  // Owner vidi sve doktore, doktor vidi samo sebe po defaultu
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<string[]>(() => {
    if (profile?.role === 'owner' || profile?.role === 'reception') return []
    return profile?.id ? [profile.id] : []
  })

  // Kada se doktori učitaju, postavi inicijalni selection
  const effectiveDoctorIds = selectedDoctorIds.length > 0
    ? selectedDoctorIds
    : doctors.map((d) => d.id)

  const { data: appointments = [], isLoading: loadingAppts, refetch } = useAppointments(date)

  const isLoading = loadingDoctors || loadingAppts

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-wrap">
        <DateNavigation date={date} onChange={setDate} />

        <div className="flex items-center gap-3 flex-wrap">
          <DoctorFilter
            doctors={doctors}
            selectedIds={effectiveDoctorIds}
            onChange={setSelectedDoctorIds}
          />

          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Osveži"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Kalendar — loading u flex-1 garantuje centar vidokruga */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" className="text-teal-600" />
          <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Učitavanje...</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <DailyCalendar
            date={date}
            appointments={appointments}
            doctors={doctors}
            selectedDoctorIds={effectiveDoctorIds}
          />
        </div>
      )}
    </div>
  )
}
