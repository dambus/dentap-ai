import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  }
}

interface UIState {
  theme: Theme
  isAgentPanelOpen: boolean
  isMobileSidebarOpen: boolean
  setTheme: (theme: Theme) => void
  toggleAgentPanel: () => void
  setAgentPanelOpen: (open: boolean) => void
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system' as Theme,
      isAgentPanelOpen: true,
      isMobileSidebarOpen: false,

      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },
      toggleAgentPanel: () => set((s) => ({ isAgentPanelOpen: !s.isAgentPanelOpen })),
      setAgentPanelOpen: (open) => set({ isAgentPanelOpen: open }),
      openMobileSidebar: () => set({ isMobileSidebarOpen: true }),
      closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
    }),
    {
      name: 'dentapp-ui',
      partialize: (s) => ({ theme: s.theme, isAgentPanelOpen: s.isAgentPanelOpen }),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme)
      },
    }
  )
)
