import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  isAgentPanelOpen: boolean
  isMobileSidebarOpen: boolean
  toggleAgentPanel: () => void
  setAgentPanelOpen: (open: boolean) => void
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isAgentPanelOpen: true,
      isMobileSidebarOpen: false,
      toggleAgentPanel: () => set((s) => ({ isAgentPanelOpen: !s.isAgentPanelOpen })),
      setAgentPanelOpen: (open) => set({ isAgentPanelOpen: open }),
      openMobileSidebar: () => set({ isMobileSidebarOpen: true }),
      closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
    }),
    { name: 'dentapp-ui', partialize: (s) => ({ isAgentPanelOpen: s.isAgentPanelOpen }) }
  )
)
