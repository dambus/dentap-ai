import { useRef } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { format, isToday, addDays, subDays } from 'date-fns'
import { sr } from 'date-fns/locale'
import { cn } from '../../../lib/utils'

interface DateNavigationProps {
  date: Date
  onChange: (date: Date) => void
}

export function DateNavigation({ date, onChange }: DateNavigationProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value) onChange(new Date(e.target.value + 'T12:00:00'))
  }

  const dateLabel = isToday(date)
    ? 'Danas'
    : format(date, 'EEEE, d. MMMM yyyy.', { locale: sr })

  const capitalizedLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(subDays(date, 1))}
        className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
        aria-label="Prethodni dan"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        onClick={() => inputRef.current?.showPicker?.()}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
          'hover:bg-slate-100 dark:hover:bg-slate-700',
          isToday(date)
            ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
            : 'text-slate-700 dark:text-slate-200'
        )}
      >
        <CalendarDays className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">{capitalizedLabel}</span>
        <span className="sm:hidden">{format(date, 'd. MMM', { locale: sr })}</span>
      </button>

      {/* Hidden native date input */}
      <input
        ref={inputRef}
        type="date"
        value={format(date, 'yyyy-MM-dd')}
        onChange={handleInputChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      <button
        onClick={() => onChange(addDays(date, 1))}
        className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
        aria-label="Sledeći dan"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {!isToday(date) && (
        <button
          onClick={() => onChange(new Date())}
          className="ml-1 px-2.5 py-1 rounded-md text-xs font-medium text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"
        >
          Danas
        </button>
      )}
    </div>
  )
}
