import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { usePeriodsStore } from '@/adapters/budget/store/periodsStore'
import { useExpensesStore } from '@/adapters/budget/store/expensesStore'
import HistoryPage from '@/adapters/budget/pages/HistoryPage'
import type { BudgetPeriod } from '@/domain/budget/model/types'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
}))

function makePeriod(id: string, month: number, year: number, netSalary: number): BudgetPeriod {
  return { id, month, year, netSalary, createdAt: `${year}-${String(month).padStart(2, '0')}-01T00:00:00Z` }
}

beforeEach(() => {
  usePeriodsStore.setState({ periods: [], activePeriodId: null, hasHydrated: true })
  useExpensesStore.setState({ expenses: [], hasHydrated: true })
  mockNavigate.mockClear()
})

function renderPage() {
  return render(
    <MemoryRouter>
      <HistoryPage />
    </MemoryRouter>,
  )
}

describe('HistoryPage', () => {
  it('shows an empty state when no periods exist', () => {
    renderPage()
    expect(screen.getByText(/no hay períodos/i)).toBeInTheDocument()
  })

  it('lists periods sorted newest first', () => {
    usePeriodsStore.setState({
      periods: [
        makePeriod('jan', 1, 2026, 100000),
        makePeriod('mar', 3, 2026, 120000),
        makePeriod('feb', 2, 2026, 110000),
      ],
      activePeriodId: 'mar',
      hasHydrated: true,
    })
    renderPage()
    const rows = screen.getAllByRole('row')
    // rows[0] = header, rows[1] = newest (March), rows[3] = oldest (Jan)
    expect(rows[1]).toHaveTextContent('Marzo')
    expect(rows[3]).toHaveTextContent('Enero')
  })

  it('shows net salary formatted in euros', () => {
    usePeriodsStore.setState({
      periods: [makePeriod('jun', 6, 2026, 2500)],
      activePeriodId: 'jun',
      hasHydrated: true,
    })
    renderPage()
    // netSalary column cell — at least one match (salary and remaining may both be 2500)
    expect(screen.getAllByText(/2500,00\s*€/).length).toBeGreaterThanOrEqual(1)
  })

  it('clicking a row sets that period as active and navigates to dashboard', () => {
    const jan = makePeriod('jan-2026', 1, 2026, 100000)
    const feb = makePeriod('feb-2026', 2, 2026, 110000)
    usePeriodsStore.setState({ periods: [jan, feb], activePeriodId: 'feb-2026', hasHydrated: true })
    renderPage()
    const rows = screen.getAllByRole('row')
    // Sorted newest-first: header | Feb | Jan — click the last data row (Enero)
    fireEvent.click(rows[rows.length - 1])
    expect(usePeriodsStore.getState().activePeriodId).toBe('jan-2026')
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  describe('comparison section', () => {
    it('does not show comparison section with only 1 period', () => {
      usePeriodsStore.setState({
        periods: [makePeriod('jan', 1, 2026, 2000)],
        activePeriodId: 'jan',
        hasHydrated: true,
      })
      renderPage()
      expect(screen.queryByText('Comparación mensual')).toBeNull()
    })

    it('shows comparison section with 2 or more periods', () => {
      usePeriodsStore.setState({
        periods: [makePeriod('jan', 1, 2026, 2000), makePeriod('feb', 2, 2026, 2100)],
        activePeriodId: 'feb',
        hasHydrated: true,
      })
      renderPage()
      expect(screen.getByText('Comparación mensual')).toBeInTheDocument()
    })

    it('"Ver resumen" button is present and enabled', () => {
      usePeriodsStore.setState({
        periods: [makePeriod('jan', 1, 2026, 2000), makePeriod('feb', 2, 2026, 2100)],
        activePeriodId: 'feb',
        hasHydrated: true,
      })
      renderPage()
      const buttons = screen.getAllByRole('button', { name: /ver resumen/i })
      expect(buttons.length).toBeGreaterThanOrEqual(1)
      buttons.forEach((btn) => expect(btn).not.toBeDisabled())
    })
  })
})
