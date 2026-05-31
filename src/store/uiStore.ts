import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  isAgentPanelOpen: boolean
  toggleAgentPanel: () => void
  setAgentPanelOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isAgentPanelOpen: true,
      toggleAgentPanel: () => set((s) => ({ isAgentPanelOpen: !s.isAgentPanelOpen })),
      setAgentPanelOpen: (open) => set({ isAgentPanelOpen: open }),
    }),
    { name: 'dentapp-ui' }
  )
)
