import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Button, Input } from '../components/ui'
import { ThemeToggle } from '../components/ui/ThemeToggle'

export function LoginPage() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const signIn = useAuthStore((s) => s.signIn)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (user) {
    return <Navigate to="/planer" replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await signIn(email, password)
    } catch {
      setError('Pogrešan email ili lozinka. Pokušajte ponovo.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      {/* Theme toggle u gornjem desnom uglu */}
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-600 text-white font-bold text-xl mb-4">
            D
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">DentApp</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Stomatološka ordinacija</p>
        </div>

        {/* Forma */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs p-6">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-5">Prijavite se</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email adresa"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ime@ordinacija.rs"
              prefixIcon={<Mail className="w-4 h-4" />}
              required
              autoComplete="email"
              autoFocus
            />

            <Input
              label="Lozinka"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              prefixIcon={<Lock className="w-4 h-4" />}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full mt-1">
              Prijavi se
            </Button>
          </form>
        </div>

        {/* Demo hint */}
        <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Demo kredencijali:</p>
          <div className="space-y-1 font-mono text-xs text-slate-600 dark:text-slate-300">
            <p>ana@demo.dentapp.rs</p>
            <p>marko@demo.dentapp.rs</p>
            <p>jelena@demo.dentapp.rs</p>
            <p className="text-slate-400 dark:text-slate-500 mt-1">Lozinka: demo1234</p>
          </div>
        </div>
      </div>
    </div>
  )
}
