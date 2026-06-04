import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useCategoriesStore } from '../store/categoriesStore'
import { usePeriodsStore } from '../store/periodsStore'
import { useExpensesStore } from '../store/expensesStore'

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/expenses', label: 'Gastos' },
  { to: '/categories', label: 'Categorías' },
  { to: '/history', label: 'Historial' },
  { to: '/recurring', label: 'Recurrentes' },
  { to: '/settings', label: 'Configuración' },
]

type LayoutProps = {
  children?: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const catHydrated = useCategoriesStore((s) => s.hasHydrated)
  const perHydrated = usePeriodsStore((s) => s.hasHydrated)
  const expHydrated = useExpensesStore((s) => s.hasHydrated)
  const allHydrated = catHydrated && perHydrated && expHydrated

  function renderContent() {
    // When children are explicitly passed (e.g. in tests), render them directly
    if (children) return children
    // In the real router, wait for store hydration before rendering
    if (!allHydrated) {
      return (
        <div className="flex items-center justify-center py-24">
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
    return <Outlet />
  }

  return (
    <div className="flex min-h-svh flex-col bg-bg-primary">
      <header className="sticky top-0 z-10 border-b border-bg-card bg-bg-primary/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold text-text-primary">
            Presupuesto Mensual
          </span>
          <nav className="flex gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        {renderContent()}
      </main>
    </div>
  )
}
