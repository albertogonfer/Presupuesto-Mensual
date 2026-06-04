import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function LoginPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password)

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-sm rounded-xl border border-bg-card bg-bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-semibold text-text-primary">
          Presupuesto Mensual
        </h1>

        {/* Tab toggle */}
        <div className="relative mb-6 flex rounded-lg bg-bg-primary p-1">
          {/* sliding indicator */}
          <div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-accent transition-transform duration-200 ease-in-out"
            style={{ transform: mode === 'login' ? 'translateX(0)' : 'translateX(calc(100% + 8px))' }}
          />
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null) }}
            className={`relative z-10 flex-1 rounded-md py-1.5 text-sm font-medium transition-colors duration-200 ${
              mode === 'login' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null) }}
            className={`relative z-10 flex-1 rounded-md py-1.5 text-sm font-medium transition-colors duration-200 ${
              mode === 'register' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-text-secondary">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-bg-primary bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="tu@email.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-text-secondary">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-bg-primary bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-accent py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
          >
            {loading
              ? 'Un momento…'
              : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}
