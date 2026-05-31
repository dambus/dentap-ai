import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/authStore'
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
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize)
  const isInitialized = useAuthStore((s) => s.isInitialized)

  useEffect(() => {
    initialize()
  }, [initialize])

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
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
