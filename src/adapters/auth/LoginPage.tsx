import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

export function LoginPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  function validate(): string | null {
    if (mode === 'register') {
      if (!name.trim()) return 'El nombre es obligatorio.'
      if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.'
      if (password !== passwordConfirm) return 'Las contraseñas no coinciden.'
    }
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    const result = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password, name.trim())
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (mode === 'register') {
      setConfirmationSent(true)
      return
    }

    navigate('/', { replace: true })
  }

  function switchMode(next: 'login' | 'register') {
    setMode(next)
    setError(null)
    setPassword('')
    setPasswordConfirm('')
    setShowPassword(false)
    setShowPasswordConfirm(false)
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-sm rounded-xl border border-bg-card bg-bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-semibold text-text-primary">
          Presupuesto Mensual
        </h1>

        {confirmationSent ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-4xl">📧</span>
            <p className="font-medium text-text-primary">Revisa tu correo</p>
            <p className="text-sm text-text-secondary">
              Te hemos enviado un enlace de confirmación a{' '}
              <span className="font-medium text-text-primary">{email}</span>.
              Haz clic en él para activar tu cuenta.
            </p>
            <button
              type="button"
              onClick={() => { setConfirmationSent(false); switchMode('login') }}
              className="mt-2 text-sm text-accent hover:underline"
            >
              Volver a iniciar sesión
            </button>
          </div>
        ) : (
          <>
            {/* Tab toggle */}
            <div className="relative mb-6 flex rounded-lg bg-bg-primary p-1">
              <div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-accent transition-transform duration-200 ease-in-out"
                style={{ transform: mode === 'login' ? 'translateX(0)' : 'translateX(calc(100% + 8px))' }}
              />
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`relative z-10 flex-1 rounded-md py-1.5 text-sm font-medium transition-colors duration-200 ${
                  mode === 'login' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`relative z-10 flex-1 rounded-md py-1.5 text-sm font-medium transition-colors duration-200 ${
                  mode === 'register' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Registrarse
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name — register only */}
              {mode === 'register' && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-sm font-medium text-text-secondary">
                    Nombre
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-lg border border-bg-primary bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Tu nombre"
                  />
                </div>
              )}

              {/* Email */}
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

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-text-secondary">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-bg-primary bg-bg-primary px-3 py-2 pr-10 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {mode === 'register' && (
                  <p className="text-xs text-text-secondary">Mínimo 6 caracteres.</p>
                )}
              </div>

              {/* Confirm password — register only */}
              {mode === 'register' && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password-confirm" className="text-sm font-medium text-text-secondary">
                    Repetir contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password-confirm"
                      type={showPasswordConfirm ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className="w-full rounded-lg border border-bg-primary bg-bg-primary px-3 py-2 pr-10 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                      aria-label={showPasswordConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      <EyeIcon open={showPasswordConfirm} />
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <p role="alert" className="text-sm text-danger">
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
          </>
        )}
      </div>
    </div>
  )
}
