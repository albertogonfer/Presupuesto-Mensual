import { useEffect } from 'react'
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

const NAV_ICONS: Record<string, string> = {
  '/': 'M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5',
  '/expenses': 'M4 4h16v16l-2-1.5L16 20l-2-1.5L12 20l-2-1.5L8 20l-2-1.5L4 20V4zm4 5h8m-8 4h5',
  '/categories': 'M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z',
  '/history': 'M4 20V10m5.5 10V4m5.5 16v-8m5.5 8V7',
  '/recurring': 'M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6',
  '/settings': 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8.4 4 1.6-2.8-2-3.4-3.1.9a8 8 0 0 0-1.9-1.1L14.3 2h-4l-.7 3.6a8 8 0 0 0-1.9 1.1l-3.1-.9-2 3.4L4.2 12l-1.6 2.8 2 3.4 3.1-.9a8 8 0 0 0 1.9 1.1l.7 3.6h4l.7-3.6a8 8 0 0 0 1.9-1.1l3.1.9 2-3.4-1.6-2.8z',
}

// Stitch information architecture: categories live inside Gastos (split-pane),
// periods inside Configuración, charts inside Analítica.
const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/expenses', label: 'Gastos' },
  { to: '/recurring', label: 'Recurrentes' },
  { to: '/history', label: 'Analítica' },
  { to: '/settings', label: 'Configuración' },
]

// Mobile bottom navigation: same five destinations, thumb-sized.
const mobileNavLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/expenses', label: 'Gastos' },
  { to: '/recurring', label: 'Recurrentes' },
  { to: '/history', label: 'Analítica' },
  { to: '/settings', label: 'Ajustes' },
]

function NavIcon({ to, className }: { to: string; className?: string }) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={NAV_ICONS[to]} />
    </svg>
  )
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

type LayoutProps = {
  children?: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
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

  const displayName = profile?.fullName?.split(' ')[0] || user?.email

  return (
    <div className="flex min-h-svh bg-bg-primary">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh w-60 flex-col border-r border-border/60 bg-bg-primary md:flex">
        <div className="px-5 py-6">
          <span className="text-lg font-semibold text-text-primary">
            Presupuesto <span className="text-accent-hover">Mensual</span>
          </span>
        </div>
        <nav aria-label="Navegación lateral" className="flex flex-1 flex-col gap-1 px-3">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-accent text-white shadow-[0_0_18px_rgba(99,102,241,0.45)]'
                    : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
                }`
              }
            >
              <NavIcon to={to} className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border/60 p-3">
          <button
            onClick={handleSignOut}
            aria-label="Cerrar sesión"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger/80 transition-colors duration-150 hover:bg-danger/10 hover:text-danger"
          >
            <LogoutIcon className="h-5 w-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar: greeting only on desktop; title + logout on mobile */}
        <header className="sticky top-0 z-10 border-b border-border/60 bg-bg-primary/60 backdrop-blur-xl">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3">
            <span className="truncate text-base font-semibold text-text-primary md:hidden">
              Presupuesto Mensual
            </span>
            <span className="hidden text-sm text-text-secondary md:inline">
              Hola, <span className="font-medium text-text-primary">{displayName}</span>
            </span>
            <div className="flex items-center gap-2 md:hidden">
              <span className="hidden text-sm text-text-secondary sm:inline">Hola, {displayName}</span>
              <button
                onClick={handleSignOut}
                aria-label="Cerrar sesión"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-danger/80 transition-colors duration-150 hover:bg-danger/10 hover:text-danger"
              >
                <LogoutIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 pb-28 md:pb-6">
          {renderContent()}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-border/60 bg-bg-primary/60 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {mobileNavLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors duration-150 ${
                  isActive ? 'text-accent-hover drop-shadow-[0_0_8px_rgba(129,140,248,0.7)]' : 'text-text-secondary'
                }`
              }
            >
              <NavIcon to={to} className="h-6 w-6" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
