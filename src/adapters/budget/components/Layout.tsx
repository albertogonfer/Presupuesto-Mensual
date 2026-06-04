import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useCategoriesStore } from '../store/categoriesStore'
import { usePeriodsStore } from '../store/periodsStore'
import { useExpensesStore } from '../store/expensesStore'
import { useRecurringExpensesStore } from '../store/recurringExpensesStore'
import { useAuth } from '../../auth/AuthContext'
import { PageSpinner } from '../../shared/components/PageSpinner'

const OLD_PERSIST_KEYS = [
  'budget-categories',
  'budget-periods',
  'budget-expenses',
  'budget-recurring',
]

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
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const fetchCategories = useCategoriesStore((s) => s.fetchAll)
  const fetchPeriods = usePeriodsStore((s) => s.fetchAll)
  const fetchExpenses = useExpensesStore((s) => s.fetchAll)
  const fetchRecurring = useRecurringExpensesStore((s) => s.fetchAll)

  const resetCategories = useCategoriesStore((s) => s.reset)
  const resetPeriods = usePeriodsStore((s) => s.reset)
  const resetExpenses = useExpensesStore((s) => s.reset)
  const resetRecurring = useRecurringExpensesStore((s) => s.reset)

  const catLoading = useCategoriesStore((s) => s.loading)
  const perLoading = usePeriodsStore((s) => s.loading)
  const expLoading = useExpensesStore((s) => s.loading)
  const recLoading = useRecurringExpensesStore((s) => s.loading)
  const anyLoading = catLoading || perLoading || expLoading || recLoading

  const periods = usePeriodsStore((s) => s.periods)

  // One-time cleanup of old Zustand-persist localStorage keys
  useEffect(() => {
    for (const key of OLD_PERSIST_KEYS) {
      localStorage.removeItem(key)
    }
  }, [])

  // Fetch all stores when the authenticated user is known
  useEffect(() => {
    if (user) {
      fetchCategories()
      fetchPeriods()
      fetchExpenses()
      fetchRecurring()
    }
  }, [user, fetchCategories, fetchPeriods, fetchExpenses, fetchRecurring])

  async function handleSignOut() {
    await signOut()
    resetCategories()
    resetPeriods()
    resetExpenses()
    resetRecurring()
    navigate('/login')
  }

  function renderContent() {
    // When children are explicitly passed (e.g. in tests), render them directly
    if (children) return children
    // Wait for all stores to load before rendering
    if (anyLoading) return <PageSpinner />
    // Guard: redirect to onboarding if no periods and onboarding not complete
    const onboardingDone = localStorage.getItem('onboarding-complete')
    if (periods.length === 0 && !onboardingDone) {
      return <Navigate to="/onboarding" replace />
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
          <nav className="flex items-center gap-1">
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
            <button
              onClick={handleSignOut}
              className="ml-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors duration-150 hover:border-danger/50 hover:text-danger"
              aria-label="Cerrar sesión"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        {renderContent()}
      </main>
    </div>
  )
}
