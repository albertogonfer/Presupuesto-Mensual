import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './adapters/budget/components/Layout'

const DashboardPage = lazy(() => import('./adapters/budget/pages/DashboardPage'))
const ExpensesPage = lazy(() => import('./adapters/budget/pages/ExpensesPage'))
const CategoriesPage = lazy(() => import('./adapters/budget/pages/CategoriesPage'))
const SettingsPage = lazy(() => import('./adapters/budget/pages/SettingsPage'))

export type AppRoute = {
  path: string
  label: string
}

export const routes: AppRoute[] = [
  { path: '/', label: 'Dashboard' },
  { path: '/expenses', label: 'Gastos' },
  { path: '/categories', label: 'Categorías' },
  { path: '/settings', label: 'Configuración' },
]

function wrap(Component: React.ComponentType) {
  return (
    <Suspense fallback={<div className="p-6 text-text-secondary">Cargando…</div>}>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: wrap(DashboardPage) },
      { path: '/expenses', element: wrap(ExpensesPage) },
      { path: '/categories', element: wrap(CategoriesPage) },
      { path: '/settings', element: wrap(SettingsPage) },
    ],
  },
])
