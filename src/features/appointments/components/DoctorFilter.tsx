import { cn } from '../../../lib/utils'
import type { DoctorOption } from '../hooks/useDoctors'

interface DoctorFilterProps {
  doctors: DoctorOption[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

const DEFAULT_COLOR = '#0B6E6E'

export function DoctorFilter({ doctors, selectedIds, onChange }: DoctorFilterProps) {
  if (doctors.length <= 1) return null

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      // Mora ostati barem jedan selektovan
      if (selectedIds.length > 1) {
        onChange(selectedIds.filter((d) => d !== id))
      }
    } else {
      onChange([...selectedIds, id])
    }
  }

  function selectAll() {
    onChange(doctors.map((d) => d.id))
  }

  const allSelected = selectedIds.length === doctors.length

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={selectAll}
        className={cn(
          'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
          allSelected
            ? 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
        )}
      >
        Svi
      </button>

      {doctors.map((doctor) => {
        const isSelected = selectedIds.includes(doctor.id)
        const color = doctor.color ?? DEFAULT_COLOR
        const name = doctor.display_name ?? `${doctor.first_name} ${doctor.last_name}`

        return (
          <button
            key={doctor.id}
            onClick={() => toggle(doctor.id)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
              isSelected
                ? 'text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
            )}
            style={isSelected ? { backgroundColor: color } : undefined}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: isSelected ? 'white' : color, opacity: isSelected ? 0.8 : 1 }}
            />
            {name}
          </button>
        )
      })}
    </div>
  )
}
