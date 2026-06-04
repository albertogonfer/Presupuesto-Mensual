import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useCategoriesStore } from '../store/categoriesStore'
import { usePeriodsStore } from '../store/periodsStore'
import { useExpensesStore } from '../store/expensesStore'
import { useRecurringExpensesStore } from '../store/recurringExpensesStore'
import { useProfileStore } from '../store/profileStore'
import { useAuth } from '../../auth/AuthContext'
import { PageSpinner } from '../../shared/components/PageSpinner'

const OLD_PERSIST_KEYS = [
  'budget-categories',
  'budget-periods',
  'budget-expenses',
  'budget-recurring',
  'onboarding-complete',
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
  const fetchProfile = useProfileStore((s) => s.fetchProfile)

  const resetCategories = useCategoriesStore((s) => s.reset)
  const resetPeriods = usePeriodsStore((s) => s.reset)
  const resetExpenses = useExpensesStore((s) => s.reset)
  const resetRecurring = useRecurringExpensesStore((s) => s.reset)
  const resetProfile = useProfileStore((s) => s.reset)

  const catLoading = useCategoriesStore((s) => s.loading)
  const perLoading = usePeriodsStore((s) => s.loading)
  const expLoading = useExpensesStore((s) => s.loading)
  const recLoading = useRecurringExpensesStore((s) => s.loading)
  const profLoading = useProfileStore((s) => s.loading)
  const anyLoading = catLoading || perLoading || expLoading || recLoading || profLoading

  const profile = useProfileStore((s) => s.profile)

  // One-time cleanup of old Zustand-persist localStorage keys
  useEffect(() => {
    for (const key of OLD_PERSIST_KEYS) {
      localStorage.removeItem(key)
    }
  }, [])

  // Fetch all stores when the authenticated user is known
  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchCategories()
      fetchPeriods()
      fetchExpenses()
      fetchRecurring()
    }
  }, [user, fetchProfile, fetchCategories, fetchPeriods, fetchExpenses, fetchRecurring])

  async function handleSignOut() {
    await signOut()
    resetProfile()
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
    // Guard: redirect to onboarding if profile says it's not completed
    if (profile && !profile.onboardingCompleted && location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />
    }
    return <Outlet />
  }

  const location = useLocation()
  const navRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, x: 0 })

  useEffect(() => {
    if (!navRef.current) return
    const active = navRef.current.querySelector<HTMLElement>('[data-active="true"]')
    if (!active) { setIndicatorStyle({ width: 0, x: 0 }); return }
    const navRect = navRef.current.getBoundingClientRect()
    const rect = active.getBoundingClientRect()
    setIndicatorStyle({ width: rect.width, x: rect.left - navRect.left })
  }, [location.pathname])

  const displayName = profile?.fullName?.split(' ')[0] || user?.email

  return (
    <div className="flex min-h-svh flex-col bg-bg-primary">
      <header className="sticky top-0 z-10 border-b border-bg-card bg-bg-primary/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold text-text-primary">
            Presupuesto Mensual
          </span>
          <nav ref={navRef} className="relative flex items-center gap-1">
            {/* Sliding indicator */}
            {indicatorStyle.width > 0 && (
              <span
                aria-hidden
                className="pointer-events-none absolute top-0 h-full rounded-md bg-accent transition-all duration-200 ease-in-out"
                style={{ width: indicatorStyle.width, transform: `translateX(${indicatorStyle.x}px)` }}
              />
            )}
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                data-active={location.pathname === to || (to !== '/' && location.pathname.startsWith(to)) ? 'true' : undefined}
                className={({ isActive }) =>
                  `relative z-10 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <button
              onClick={handleSignOut}
              className="ml-2 flex items-center gap-2 rounded-md border border-danger/30 bg-danger/5 px-3 py-1.5 text-sm font-medium text-danger/80 transition-colors duration-150 hover:border-danger/60 hover:bg-danger/10 hover:text-danger"
              aria-label="Cerrar sesión"
            >
              <span className="text-text-secondary font-normal">
                Hola, {displayName}
              </span>
              <span className="text-danger/40">·</span>
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
