import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Spinner } from '../ui'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const isInitialized = useAuthStore((s) => s.isInitialized)

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Spinner size="lg" className="text-teal-600" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
