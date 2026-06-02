import { Sidebar } from './Sidebar'
import { MobileHeader } from './MobileHeader'
import { MobileNav } from './MobileNav'
import { MobileSidebar } from './MobileSidebar'
import { MobileAgentPanel } from './MobileAgentPanel'
import { AgentPanel } from './AgentPanel'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Desktop: sidebar levo (lg+) */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Centralni stub */}
      <div className="flex flex-col flex-1 min-w-0">
        <MobileHeader />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
        <MobileNav />
      </div>

      {/* Desktop: agent panel desno (lg+) */}
      <div className="hidden lg:flex">
        <AgentPanel />
      </div>

      {/* Mobile/tablet overlays */}
      <MobileSidebar />
      <MobileAgentPanel />
    </div>
  )
}
