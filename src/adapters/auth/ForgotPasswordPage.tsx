import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await resetPassword(email)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setSent(true)
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-sm rounded-xl border border-bg-card bg-bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-semibold text-text-primary">
          Presupuesto Mensual
        </h1>

        {sent ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-4xl">📧</span>
            <p className="font-medium text-text-primary">Revisa tu correo</p>
            <p className="text-sm text-text-secondary">
              Si existe una cuenta con <span className="font-medium text-text-primary">{email}</span>, recibirás un enlace para restablecer tu contraseña.
            </p>
            <Link to="/login" className="mt-2 text-sm text-accent hover:underline">
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-text-secondary text-center">
              Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>
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

              {error && (
                <p role="alert" className="text-sm text-danger">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-lg bg-accent py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
              >
                {loading ? 'Un momento…' : 'Enviar enlace'}
              </button>

              <Link to="/login" className="text-center text-sm text-text-secondary hover:text-text-primary">
                Volver a iniciar sesión
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
