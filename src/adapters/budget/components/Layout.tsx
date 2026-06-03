import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/expenses', label: 'Gastos' },
  { to: '/categories', label: 'Categorías' },
  { to: '/settings', label: 'Configuración' },
]

type LayoutProps = {
  children?: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-svh flex-col bg-bg-primary">
      <header className="sticky top-0 z-10 border-b border-bg-card bg-bg-primary/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold text-text-primary">Presupuesto Mensual</span>
          <nav className="flex gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {children ?? <Outlet />}
      </main>
    </div>
  )
}
