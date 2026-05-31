import { Sidebar } from './Sidebar'
import { AgentPanelPlaceholder } from './AgentPanelPlaceholder'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <AgentPanelPlaceholder />
    </div>
  )
}
