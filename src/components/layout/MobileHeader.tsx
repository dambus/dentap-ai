import { Menu, Bot } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'

const ROUTE_LABELS: Record<string, string> = {
  '/planer': 'Planer',
  '/pacijenti': 'Pacijenti',
  '/posete': 'Posete',
  '/podesavanja': 'Podešavanja',
}

export function MobileHeader() {
  const openMobileSidebar = useUIStore((s) => s.openMobileSidebar)
  const toggleAgentPanel = useUIStore((s) => s.toggleAgentPanel)
  const clinic = useAuthStore((s) => s.clinic)
  const { pathname } = useLocation()

  const label = Object.entries(ROUTE_LABELS).find(([key]) =>
    pathname.startsWith(key)
  )?.[1] ?? clinic?.name ?? 'DentApp'

  return (
    <header className="flex items-center justify-between h-14 px-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shrink-0 lg:hidden">
      <button
        onClick={openMobileSidebar}
        className="p-2 -ml-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        aria-label="Otvori meni"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
          D
        </div>
        <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{label}</span>
      </div>

      <button
        onClick={toggleAgentPanel}
        className="p-2 -mr-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        aria-label="AI Asistent"
      >
        <Bot className="w-5 h-5" />
      </button>
    </header>
  )
}
