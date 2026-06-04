import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { useCategoriesStore } from '@/adapters/budget/store/categoriesStore'
import { usePeriodsStore } from '@/adapters/budget/store/periodsStore'
import { useExpensesStore } from '@/adapters/budget/store/expensesStore'
import DashboardPage from '@/adapters/budget/pages/DashboardPage'

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
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const CAT = { id: 'cat-1', name: 'Comida', color: '#10B981', icon: '🛒', createdAt: '2026-01-01T00:00:00Z' }
const PERIOD = { id: 'period-1', month: 6, year: 2026, netSalary: 2500, createdAt: '2026-06-01T00:00:00Z' }

function resetStores() {
  useCategoriesStore.setState({ categories: [CAT] })
  usePeriodsStore.setState({ periods: [PERIOD], activePeriodId: 'period-1' })
  useExpensesStore.setState({ expenses: [] })
}

beforeEach(resetStores)

describe('DashboardPage', () => {
  it('shows period header with month, year and net salary', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    // h1 heading shows month and year
    expect(screen.getByRole('heading', { name: /junio 2026/i })).toBeInTheDocument()
    expect(screen.getAllByText(/2500,00\s*€/).length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty state when no expenses', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByText(/aún no tienes gastos registrados/i)).toBeInTheDocument()
  })

  it('shows stat cards when expenses exist', () => {
    useExpensesStore.setState({
      expenses: [
        { id: 'e1', periodId: 'period-1', categoryId: 'cat-1', description: 'Mercadona', amount: 600, date: '2026-06-01', createdAt: '2026-06-01T00:00:00Z' },
      ],
    })
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    // Total gastado label
    expect(screen.getByText(/total gastado/i)).toBeInTheDocument()
    // Remaining: 2500 - 600 = 1900
    expect(screen.getByText(/1900,00\s*€/)).toBeInTheDocument()
  })

  it('shows empty state prompting to configure a period when no active period', () => {
    usePeriodsStore.setState({ periods: [], activePeriodId: null })
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByText(/configura un período/i)).toBeInTheDocument()
  })

  it('shows FAB when active period exists', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /\+ gasto/i })).toBeInTheDocument()
  })

  it('hides FAB when no active period', () => {
    usePeriodsStore.setState({ periods: [], activePeriodId: null })
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.queryByRole('button', { name: /\+ gasto/i })).not.toBeInTheDocument()
  })

  it('opens expense form modal when FAB is clicked', async () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    await userEvent.click(screen.getByRole('button', { name: /\+ gasto/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows savings goal card when period has savingsGoal', () => {
    usePeriodsStore.setState({
      periods: [{ ...PERIOD, savingsGoal: 500 }],
      activePeriodId: 'period-1',
    })
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByText(/objetivo de ahorro/i)).toBeInTheDocument()
    expect(screen.getByText(/500,00\s*€\s*objetivo/i)).toBeInTheDocument()
  })

  it('hides savings goal card when period has no savingsGoal', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.queryByText(/objetivo de ahorro/i)).not.toBeInTheDocument()
  })

  it('shows positive savings progress in green when remaining > savingsGoal', () => {
    usePeriodsStore.setState({
      periods: [{ ...PERIOD, savingsGoal: 500 }],
      activePeriodId: 'period-1',
    })
    useExpensesStore.setState({
      expenses: [
        { id: 'e1', periodId: 'period-1', categoryId: 'cat-1', description: 'Mercadona', amount: 1000, date: '2026-06-01', createdAt: '2026-06-01T00:00:00Z' },
      ],
    })
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    // remaining = 2500 - 1000 = 1500; savingsProgress = 1500 - 500 = 1000 → positive
    expect(screen.getByText(/te quedan/i)).toBeInTheDocument()
  })

  it('shows negative savings progress message when remaining < savingsGoal', () => {
    usePeriodsStore.setState({
      periods: [{ ...PERIOD, savingsGoal: 2000 }],
      activePeriodId: 'period-1',
    })
    useExpensesStore.setState({
      expenses: [
        { id: 'e1', periodId: 'period-1', categoryId: 'cat-1', description: 'Mercadona', amount: 1000, date: '2026-06-01', createdAt: '2026-06-01T00:00:00Z' },
      ],
    })
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    // remaining = 1500; savingsProgress = 1500 - 2000 = -500 → negative
    expect(screen.getByText(/faltan/i)).toBeInTheDocument()
  })
})

describe('DashboardPage — category budget limit', () => {
  const CAT_WITH_LIMIT = { ...CAT, limit: 500 }
  const EXPENSE_300 = { id: 'e1', periodId: 'period-1', categoryId: 'cat-1', description: 'Mercadona', amount: 300, date: '2026-06-01', createdAt: '2026-06-01T00:00:00Z' }

  beforeEach(() => {
    useCategoriesStore.setState({ categories: [CAT_WITH_LIMIT] })
    useExpensesStore.setState({ expenses: [EXPENSE_300] })
  })

  it('shows "X € / Y €" when limit is set', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByText(/300,00\s*€\s*\/\s*500,00\s*€/)).toBeInTheDocument()
  })

  it('shows "Límite superado" and red bar when spent >= limit', () => {
    useCategoriesStore.setState({ categories: [{ ...CAT, limit: 300 }] })
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByText(/límite superado/i)).toBeInTheDocument()
    // The progress bar should have bg-danger class
    const bar = document.querySelector('.bg-danger')
    expect(bar).toBeInTheDocument()
  })

  it('shows yellow bar when spent >= 80% of limit but under limit', () => {
    // spent=300, limit=350 → 300/350 = 85.7% → amber
    useCategoriesStore.setState({ categories: [{ ...CAT, limit: 350 }] })
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    const bar = document.querySelector('.bg-yellow-500')
    expect(bar).toBeInTheDocument()
  })

  it('does not show limit indicator when category has no limit', () => {
    useCategoriesStore.setState({ categories: [CAT] })
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.queryByText(/límite superado/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/300,00\s*€\s*\/\s*/)).not.toBeInTheDocument()
  })
})
