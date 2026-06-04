import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCategoriesStore } from '../store/categoriesStore'
import { usePeriodsStore } from '../store/periodsStore'
import { useExpensesStore } from '../store/expensesStore'
import DashboardPage from './DashboardPage'

// Mock Recharts to avoid ResizeObserver / canvas issues in jsdom
vi.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Cell: () => null,
  Tooltip: () => null,
  Legend: () => null,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const CAT = { id: 'cat-1', name: 'Comida', color: '#10B981', icon: '🛒', createdAt: '2026-01-01T00:00:00Z' }
const PERIOD = { id: 'period-1', month: 6, year: 2026, netSalary: 2500, createdAt: '2026-06-01T00:00:00Z' }

function resetStores() {
  useCategoriesStore.setState({ categories: [CAT], hasHydrated: true })
  usePeriodsStore.setState({ periods: [PERIOD], activePeriodId: 'period-1', hasHydrated: true })
  useExpensesStore.setState({ expenses: [], hasHydrated: true })
}

beforeEach(resetStores)

describe('DashboardPage', () => {
  it('shows period header with month, year and net salary', () => {
    render(<DashboardPage />)
    // h1 heading shows month and year
    expect(screen.getByRole('heading', { name: /junio 2026/i })).toBeInTheDocument()
    expect(screen.getAllByText(/2500,00\s*€/).length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty state when no expenses', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/aún no tienes gastos registrados/i)).toBeInTheDocument()
  })

  it('shows stat cards when expenses exist', () => {
    useExpensesStore.setState({
      expenses: [
        { id: 'e1', periodId: 'period-1', categoryId: 'cat-1', description: 'Mercadona', amount: 600, date: '2026-06-01', createdAt: '2026-06-01T00:00:00Z' },
      ],
      hasHydrated: true,
    })
    render(<DashboardPage />)
    // Total gastado label
    expect(screen.getByText(/total gastado/i)).toBeInTheDocument()
    // Remaining: 2500 - 600 = 1900
    expect(screen.getByText(/1900,00\s*€/)).toBeInTheDocument()
  })

  it('shows empty state prompting to configure a period when no active period', () => {
    usePeriodsStore.setState({ periods: [], activePeriodId: null, hasHydrated: true })
    render(<DashboardPage />)
    expect(screen.getByText(/configura un período/i)).toBeInTheDocument()
  })

  it('shows FAB when active period exists', () => {
    render(<DashboardPage />)
    expect(screen.getByRole('button', { name: /\+ gasto/i })).toBeInTheDocument()
  })

  it('hides FAB when no active period', () => {
    usePeriodsStore.setState({ periods: [], activePeriodId: null, hasHydrated: true })
    render(<DashboardPage />)
    expect(screen.queryByRole('button', { name: /\+ gasto/i })).not.toBeInTheDocument()
  })

  it('opens expense form modal when FAB is clicked', async () => {
    render(<DashboardPage />)
    await userEvent.click(screen.getByRole('button', { name: /\+ gasto/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows category breakdown with category name when expenses exist', () => {
    useExpensesStore.setState({
      expenses: [
        { id: 'e1', periodId: 'period-1', categoryId: 'cat-1', description: 'Mercadona', amount: 300, date: '2026-06-01', createdAt: '2026-06-01T00:00:00Z' },
      ],
      hasHydrated: true,
    })
    render(<DashboardPage />)
    expect(screen.getByText('Comida')).toBeInTheDocument()
  })
})
