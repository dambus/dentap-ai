import { NavLink } from 'react-router-dom'
import { Calendar, Users, ClipboardList, Settings, LogOut, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { Avatar } from '../ui'
import { ThemeToggle } from '../ui/ThemeToggle'

const NAV_ITEMS = [
  { href: '/planer', label: 'Planer', icon: Calendar },
  { href: '/pacijenti', label: 'Pacijenti', icon: Users },
  { href: '/posete', label: 'Posete', icon: ClipboardList },
  { href: '/podesavanja', label: 'Podešavanja', icon: Settings },
]

export function MobileSidebar() {
  const isOpen = useUIStore((s) => s.isMobileSidebarOpen)
  const close = useUIStore((s) => s.closeMobileSidebar)
  const profile = useAuthStore((s) => s.profile)
  const clinic = useAuthStore((s) => s.clinic)
  const signOut = useAuthStore((s) => s.signOut)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />

      <aside className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-slate-800 shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
              D
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
              {clinic?.name ?? 'DentApp'}
            </span>
          </div>
          <button
            onClick={close}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              onClick={close}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500')} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-4 border-t border-slate-200 dark:border-slate-700 pt-3 space-y-3">
          <ThemeToggle />
          <div className="flex items-center gap-2.5 px-1 py-1.5 rounded-md">
            <Avatar name={profile ? `${profile.first_name} ${profile.last_name}` : '?'} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                {profile?.display_name ?? `${profile?.first_name} ${profile?.last_name}`}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {profile?.role === 'owner' ? 'Vlasnik' :
                 profile?.role === 'doctor' ? 'Doktor' :
                 profile?.role === 'reception' ? 'Recepcija' : ''}
              </p>
            </div>
            <button
              onClick={() => { signOut(); close() }}
              className="p-2 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
