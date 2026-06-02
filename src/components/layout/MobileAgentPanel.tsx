import { X, Bot } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useAgentTitle } from '../../agent/useAgentTitle'
import { AgentChat } from './AgentPanel'

export function MobileAgentPanel() {
  const isOpen = useUIStore((s) => s.isAgentPanelOpen)
  const setOpen = useUIStore((s) => s.setAgentPanelOpen)
  const title = useAgentTitle()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Panel — slide in from right */}
      <aside className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-white dark:bg-slate-800 shadow-xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
              {title}
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat */}
        <div className="flex-1 min-h-0">
          <AgentChat compact />
        </div>
      </aside>
    </div>
  )
}
