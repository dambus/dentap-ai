import { Sun, Moon, Monitor } from 'lucide-react'
import { useUIStore, type Theme } from '../../store/uiStore'
import { cn } from '../../lib/utils'

interface ThemeToggleProps {
  className?: string
}

const OPTIONS: { value: Theme; icon: React.ElementType; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Svetla' },
  { value: 'system', icon: Monitor, label: 'Sistem' },
  { value: 'dark', icon: Moon, label: 'Tamna' },
]

export function ThemeToggle({ className }: ThemeToggleProps) {
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 p-1 rounded-lg',
        'bg-slate-100 dark:bg-slate-700',
        className
      )}
      role="group"
      aria-label="Izaberi temu"
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          aria-pressed={theme === value}
          className={cn(
            'flex items-center justify-center w-7 h-7 rounded-md transition-colors',
            theme === value
              ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-xs'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  )
}
