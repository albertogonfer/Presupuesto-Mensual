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
})
