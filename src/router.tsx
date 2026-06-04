import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './adapters/budget/components/Layout'

const DashboardPage = lazy(() => import('./adapters/budget/pages/DashboardPage'))
const ExpensesPage = lazy(() => import('./adapters/budget/pages/ExpensesPage'))
const CategoriesPage = lazy(() => import('./adapters/budget/pages/CategoriesPage'))
const BudgetPeriodPage = lazy(() => import('./adapters/budget/pages/BudgetPeriodPage'))
const HistoryPage = lazy(() => import('./adapters/budget/pages/HistoryPage'))
const RecurringExpensesPage = lazy(() => import('./adapters/budget/pages/RecurringExpensesPage'))

export type AppRoute = {
  path: string
  label: string
}

export const routes: AppRoute[] = [
  { path: '/', label: 'Dashboard' },
  { path: '/expenses', label: 'Gastos' },
  { path: '/categories', label: 'Categorías' },
  { path: '/history', label: 'Historial' },
  { path: '/recurring', label: 'Recurrentes' },
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
      { path: '/history', element: wrap(HistoryPage) },
      { path: '/recurring', element: wrap(RecurringExpensesPage) },
      { path: '/settings', element: wrap(BudgetPeriodPage) },
    ],
  },
])
