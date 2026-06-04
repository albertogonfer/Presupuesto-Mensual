import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { usePeriodsStore } from '../store/periodsStore'
import { useExpensesStore } from '../store/expensesStore'
import HistoryPage from './HistoryPage'

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
    act(() => {
      usePeriodsStore.getState().createPeriod({ month: 1, year: 2026, netSalary: 100000 })
      usePeriodsStore.getState().createPeriod({ month: 3, year: 2026, netSalary: 120000 })
      usePeriodsStore.getState().createPeriod({ month: 2, year: 2026, netSalary: 110000 })
    })
    renderPage()
    const rows = screen.getAllByRole('row')
    // rows[0] = header, rows[1] = newest (March), rows[3] = oldest (Jan)
    expect(rows[1]).toHaveTextContent('Marzo')
    expect(rows[3]).toHaveTextContent('Enero')
  })

  it('shows net salary formatted in euros', () => {
    act(() => {
      usePeriodsStore.getState().createPeriod({ month: 6, year: 2026, netSalary: 2500 })
    })
    renderPage()
    // netSalary column cell — at least one match (salary and remaining may both be 2500)
    expect(screen.getAllByText(/2500,00\s*€/).length).toBeGreaterThanOrEqual(1)
  })

  it('clicking a row sets that period as active and navigates to dashboard', () => {
    act(() => {
      usePeriodsStore.getState().createPeriod({ month: 1, year: 2026, netSalary: 100000 })
      usePeriodsStore.getState().createPeriod({ month: 2, year: 2026, netSalary: 110000 })
    })
    const periods = usePeriodsStore.getState().periods
    const januaryId = periods.find((p) => p.month === 1)!.id
    renderPage()
    const rows = screen.getAllByRole('row')
    // Sorted newest-first: header | Feb | Jan — click the last data row (Enero)
    fireEvent.click(rows[rows.length - 1])
    expect(usePeriodsStore.getState().activePeriodId).toBe(januaryId)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  describe('comparison section', () => {
    it('does not show comparison section with only 1 period', () => {
      act(() => {
        usePeriodsStore.getState().createPeriod({ month: 1, year: 2026, netSalary: 2000 })
      })
      renderPage()
      expect(screen.queryByText('Comparación mensual')).toBeNull()
    })

    it('shows comparison section with 2 or more periods', () => {
      act(() => {
        usePeriodsStore.getState().createPeriod({ month: 1, year: 2026, netSalary: 2000 })
        usePeriodsStore.getState().createPeriod({ month: 2, year: 2026, netSalary: 2100 })
      })
      renderPage()
      expect(screen.getByText('Comparación mensual')).toBeInTheDocument()
    })

    it('"Ver resumen" button is present and disabled', () => {
      act(() => {
        usePeriodsStore.getState().createPeriod({ month: 1, year: 2026, netSalary: 2000 })
        usePeriodsStore.getState().createPeriod({ month: 2, year: 2026, netSalary: 2100 })
      })
      renderPage()
      const buttons = screen.getAllByRole('button', { name: /ver resumen/i })
      expect(buttons.length).toBeGreaterThanOrEqual(1)
      buttons.forEach((btn) => expect(btn).toBeDisabled())
    })
  })
})
