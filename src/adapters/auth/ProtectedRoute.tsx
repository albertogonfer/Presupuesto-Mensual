import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

function LoadingSpinner() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-bg-primary">
      <div className="flex flex-col items-center gap-3 text-text-secondary">
        <svg
          className="h-8 w-8 animate-spin text-accent"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span className="text-sm">Cargando…</span>
      </div>
    </div>
  )
}

type Props = {
  children: ReactNode
}

export function ProtectedRoute({ children }: Props) {
  const { session, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!session) return <Navigate to="/login" replace />

  return <>{children}</>
}
