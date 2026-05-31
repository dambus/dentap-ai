import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { format, startOfWeek, endOfWeek, isThisWeek, addWeeks, subWeeks } from 'date-fns'
import { sr } from 'date-fns/locale'
import { cn } from '../../../lib/utils'

interface WeekNavigationProps {
  date: Date
  onChange: (date: Date) => void
}

export function WeekNavigation({ date, onChange }: WeekNavigationProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
  const isCurrentWeek = isThisWeek(date, { weekStartsOn: 1 })

  const rangeLabel = `${format(weekStart, 'd. MMM', { locale: sr })} – ${format(weekEnd, 'd. MMM yyyy.', { locale: sr })}`
  const capitalizedLabel = rangeLabel.charAt(0).toUpperCase() + rangeLabel.slice(1)

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(subWeeks(date, 1))}
        className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
        aria-label="Prethodna nedelja"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium',
          isCurrentWeek
            ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
            : 'text-slate-700 dark:text-slate-200'
        )}
      >
        <CalendarDays className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">{capitalizedLabel}</span>
        <span className="sm:hidden">{format(weekStart, 'd. MMM', { locale: sr })}</span>
      </div>

      <button
        onClick={() => onChange(addWeeks(date, 1))}
        className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
        aria-label="Sledeća nedelja"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {!isCurrentWeek && (
        <button
          onClick={() => onChange(new Date())}
          className="ml-1 px-2.5 py-1 rounded-md text-xs font-medium text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"
        >
          Ova nedelja
        </button>
      )}
    </div>
  )
}
