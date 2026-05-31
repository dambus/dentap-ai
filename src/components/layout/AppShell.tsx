import { Sidebar } from './Sidebar'
import { MobileHeader } from './MobileHeader'
import { MobileNav } from './MobileNav'
import { MobileSidebar } from './MobileSidebar'
import { AgentPanelPlaceholder } from './AgentPanelPlaceholder'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop: sidebar levo (lg+) */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Centralni stub: header (mobile) + main + bottom nav (mobile) */}
      <div className="flex flex-col flex-1 min-w-0">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <MobileNav />
      </div>

      {/* Desktop: agent panel desno (lg+) */}
      <div className="hidden lg:flex">
        <AgentPanelPlaceholder />
      </div>

      {/* Mobile/tablet: slide-in drawer */}
      <MobileSidebar />
    </div>
  )
}
