import { NavLink } from 'react-router-dom'
import { Calendar, Users, ClipboardList, Settings } from 'lucide-react'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [
  { href: '/planer', label: 'Planer', icon: Calendar },
  { href: '/pacijenti', label: 'Pacijenti', icon: Users },
  { href: '/posete', label: 'Posete', icon: ClipboardList },
  { href: '/podesavanja', label: 'Podešavanja', icon: Settings },
]

export function MobileNav() {
  return (
    <nav className="flex items-center bg-white border-t border-slate-200 shrink-0 lg:hidden">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
        <NavLink
          key={href}
          to={href}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors',
              isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-700'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn('w-5 h-5', isActive && 'text-teal-600')} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
