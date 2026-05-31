import { NavLink } from 'react-router-dom'
import { Calendar, Users, ClipboardList, Settings, LogOut } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../store/authStore'
import { Avatar, Tooltip, TooltipProvider } from '../ui'
import { ThemeToggle } from '../ui/ThemeToggle'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { href: '/planer', label: 'Planer', icon: Calendar },
  { href: '/pacijenti', label: 'Pacijenti', icon: Users },
  { href: '/posete', label: 'Posete', icon: ClipboardList },
  { href: '/podesavanja', label: 'Podešavanja', icon: Settings },
]

export function Sidebar() {
  const profile = useAuthStore((s) => s.profile)
  const clinic = useAuthStore((s) => s.clinic)
  const signOut = useAuthStore((s) => s.signOut)

  return (
    <TooltipProvider>
      <aside className="flex flex-col w-60 shrink-0 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
        {/* Logo i naziv klinike */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-teal-600 text-white font-bold text-sm shrink-0">
            D
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
            {clinic?.name ?? 'DentApp'}
          </span>
        </div>

        {/* Navigacija */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0',
                      isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'
                    )}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Theme toggle + user info */}
        <div className="px-2 pb-3 border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2">
          <div className="px-2">
            <ThemeToggle className="w-full justify-center" />
          </div>
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md">
            <Avatar
              name={profile ? `${profile.first_name} ${profile.last_name}` : '?'}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                {profile?.display_name ?? `${profile?.first_name} ${profile?.last_name}`}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate capitalize">
                {profile?.role === 'owner' ? 'Vlasnik' :
                 profile?.role === 'doctor' ? 'Doktor' :
                 profile?.role === 'reception' ? 'Recepcija' :
                 profile?.role ?? ''}
              </p>
            </div>
            <Tooltip content="Odjavi se" side="right">
              <button
                onClick={signOut}
                className="p-1.5 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
