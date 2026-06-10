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

// Mobile bottom navigation: max 5 destinations for thumb reach.
// "Recurrentes" stays reachable from the dashboard widget and desktop nav.
const mobileNavLinks = [
  { to: '/', label: 'Inicio', icon: 'M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5' },
  { to: '/expenses', label: 'Gastos', icon: 'M4 4h16v16l-2-1.5L16 20l-2-1.5L12 20l-2-1.5L8 20l-2-1.5L4 20V4zm4 5h8m-8 4h5' },
  { to: '/categories', label: 'Categorías', icon: 'M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z' },
  { to: '/history', label: 'Historial', icon: 'M4 20V10m5.5 10V4m5.5 16v-8m5.5 8V7' },
  { to: '/settings', label: 'Ajustes', icon: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8.4 4 1.6-2.8-2-3.4-3.1.9a8 8 0 0 0-1.9-1.1L14.3 2h-4l-.7 3.6a8 8 0 0 0-1.9 1.1l-3.1-.9-2 3.4L4.2 12l-1.6 2.8 2 3.4 3.1-.9a8 8 0 0 0 1.9 1.1l.7 3.6h4l.7-3.6a8 8 0 0 0 1.9-1.1l3.1.9 2-3.4-1.6-2.8z' },
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
      <header className="sticky top-0 z-10 border-b border-border/60 bg-bg-primary/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3">
          <span className="truncate text-base font-semibold text-text-primary sm:text-lg">
            Presupuesto Mensual
          </span>
          <div className="flex items-center gap-1">
            <nav ref={navRef} className="relative hidden items-center gap-1 md:flex">
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
            </nav>
            <button
              onClick={handleSignOut}
              className="flex min-h-11 items-center gap-2 rounded-md border border-danger/30 bg-danger/5 px-3 py-1.5 text-sm font-medium text-danger/80 transition-colors duration-150 hover:border-danger/60 hover:bg-danger/10 hover:text-danger md:ml-2 md:min-h-0"
              aria-label="Cerrar sesión"
            >
              <span className="hidden font-normal text-text-secondary sm:inline">
                Hola, {displayName}
              </span>
              <span className="hidden text-danger/40 sm:inline">·</span>
              <span className="hidden sm:inline">Cerrar sesión</span>
              <svg aria-hidden className="h-5 w-5 sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 pb-28 md:pb-6">
        {renderContent()}
      </main>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-border/60 bg-bg-primary/60 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {mobileNavLinks.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors duration-150 ${
                  isActive ? 'text-accent-hover' : 'text-text-secondary'
                }`
              }
            >
              <svg aria-hidden className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={icon} />
              </svg>
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
