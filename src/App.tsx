import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider, QueryCache, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from './store/authStore'
import { supabase } from './lib/supabase'
import { ProtectedRoute, AppShell } from './components/layout'
import { Spinner } from './components/ui'
import { LoginPage } from './pages/LoginPage'
import { PlanerPage } from './pages/PlanerPage'
import { PacijentiPage } from './pages/PacijentiPage'
import { PacijentPage } from './pages/PacijentPage'
import { PostePage } from './pages/PostePage'
import { PosetaPage } from './pages/PosetaPage'
import { PodesavanjaPage } from './pages/PodesavanjaPage'
import { DevKitchen } from './pages/DevKitchen'

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      const msg = (error as Error)?.message?.toLowerCase() ?? ''
      if (msg.includes('jwt') || msg.includes('expired') || msg.includes('unauthorized') || msg.includes('invalid token')) {
        useAuthStore.getState().signOut()
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: (failureCount, error) => {
        const msg = (error as Error)?.message?.toLowerCase() ?? ''
        // Auth greške — ne ponavljaj, odmah odustaj
        if (msg.includes('jwt') || msg.includes('expired') || msg.includes('unauthorized')) {
          return false
        }
        return failureCount < 1
      },
    },
  },
})

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize)
  const signOut = useAuthStore((s) => s.signOut)
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const qc = useQueryClient()

  useEffect(() => {
    initialize()
  }, [initialize])

  // Kad korisnik vrati tab u fokus posle neaktivnosti:
  // 1. getSession() "odblokira" Supabase-ov interni refresh lock
  // 2. Ako nema sesije → signOut (redirect na login)
  // 3. Ako ima sesije → force-refetch svih aktivnih query-a koji su
  //    možda ostali u pending/disabled stanju dok je refresh bio blokiran
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          await signOut()
          return
        }
        // Kick-off svih query-a koji čekaju (disabled ili stale)
        void qc.refetchQueries({ type: 'active' })
      } catch {
        await signOut()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [signOut, qc])

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <Spinner size="lg" className="text-teal-600" />
      </div>
    )
  }

  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer>
          <Routes>
            {/* Javne rute */}
            <Route path="/login" element={<LoginPage />} />
            {import.meta.env.DEV && (
              <Route path="/dev" element={<DevKitchen />} />
            )}

            {/* Zaštićene rute — u okviru AppShell */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Navigate to="/planer" replace />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/planer"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <PlanerPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pacijenti"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <PacijentiPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pacijenti/:id"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <PacijentPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/posete"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <PostePage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/posete/:id"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <PosetaPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/podesavanja"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <PodesavanjaPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/planer" replace />} />
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
