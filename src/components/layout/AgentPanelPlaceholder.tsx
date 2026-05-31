import { Bot, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useUIStore } from '../../store/uiStore'

export function AgentPanelPlaceholder() {
  const isOpen = useUIStore((s) => s.isAgentPanelOpen)
  const toggle = useUIStore((s) => s.toggleAgentPanel)

  return (
    <div
      className={cn(
        'relative flex flex-col shrink-0 h-screen',
        'bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700',
        'transition-all duration-200',
        isOpen ? 'w-80' : 'w-10'
      )}
    >
      {/* Toggle dugme */}
      <button
        onClick={toggle}
        className={cn(
          'absolute top-1/2 -translate-y-1/2 -left-3 z-10',
          'flex items-center justify-center w-6 h-6',
          'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full shadow-sm',
          'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors'
        )}
        title={isOpen ? 'Zatvori agent panel' : 'Otvori agent panel'}
      >
        {isOpen ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {isOpen ? (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-4 h-14 border-b border-slate-200 dark:border-slate-700">
            <Bot className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">AI Asistent</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
              <Bot className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Agent dolazi uskoro</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Task 017–020</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center pt-16 gap-3">
          <Bot className="w-4 h-4 text-slate-300 dark:text-slate-600" />
        </div>
      )}
    </div>
  )
}
