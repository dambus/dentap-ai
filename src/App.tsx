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

  // Proaktivni token refresh svakih 45 minuta.
  // Supabase auto-refresh se aktivira tek u poslednjih 30s pre isteka (60min token).
  // Taj "rush refresh" pod vremenskim pritiskom često se zaglavi na sporom Docker setup-u.
  // Ovde mi sami refreshujemo token dok je sve mirno — pre nego što Supabase krene.
  useEffect(() => {
    const REFRESH_INTERVAL = 45 * 60 * 1000 // 45 minuta

    const interval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return // nije ulogovan, ignorišemo
        // refreshSession() uvek traži novi token bez obzira na stanje
        await supabase.auth.refreshSession()
      } catch {
        // Greška pri refresh-u je bezopasna ovde — auto-refresh će pokušati ponovo
      }
    }, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  // Detekcija dugotrajne inaktivnosti → reload stranice.
  //
  // Chrome "Page Lifecycle": posle ~5min inaktivnosti Chrome ZAMRZNE tab
  // (suspenduje JS izvršavanje). Kada se odmrzne, Supabase klijentovo stanje
  // (_isRefreshing, pending promises) je korumpirano — staro pre zamrzavanja,
  // ali mreža je prekinula vezu. fetchWithTimeout ne pomaže jer je i on bio
  // zamrznut. Jedino pouzdano rešenje: reload koji čisti celo JS stanje.
  //
  // Prag: 10 minuta. Za stomatološku ordinaciju ovo je prihvatljivo —
  // doktor koji se vraća posle 10+ minuta (između pacijenata) vidi
  // kratak loading screen i nastavlja normalno rad.
  useEffect(() => {
    const RELOAD_THRESHOLD_MS = 10 * 60 * 1000 // 10 minuta
    let hiddenAt: number | null = null

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now()
        return
      }

      // Stranica ponovo vidljiva
      const hiddenDurationMs = hiddenAt != null ? Date.now() - hiddenAt : 0
      hiddenAt = null

      if (hiddenDurationMs > RELOAD_THRESHOLD_MS) {
        // Dugo odsustvo → reload čisti korumpirano Supabase stanje
        window.location.reload()
        return
      }

      // Kratko odsustvo (<10min) → samo proveri sesiju i refetch-uj
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          await signOut()
          return
        }
        void qc.refetchQueries({ type: 'active' })
      } catch {
        await signOut()
      }
    }

    // freeze/resume: Chrome eksplicitni Page Lifecycle eventi
    // (precizniji od visibilitychange za detekciju zamrznutih tabova)
    const handleFreeze = () => { hiddenAt = Date.now() }
    const handleResume = () => {
      const frozenMs = hiddenAt != null ? Date.now() - hiddenAt : 0
      if (frozenMs > RELOAD_THRESHOLD_MS) {
        window.location.reload()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('freeze', handleFreeze)
    document.addEventListener('resume', handleResume)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('freeze', handleFreeze)
      document.removeEventListener('resume', handleResume)
    }
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
