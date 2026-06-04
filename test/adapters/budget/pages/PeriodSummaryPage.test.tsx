import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { usePeriodsStore } from '@/adapters/budget/store/periodsStore'
import { useExpensesStore } from '@/adapters/budget/store/expensesStore'
import { useCategoriesStore } from '@/adapters/budget/store/categoriesStore'
import PeriodSummaryPage from '@/adapters/budget/pages/PeriodSummaryPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => {
  usePeriodsStore.setState({ periods: [], activePeriodId: null, hasHydrated: true })
  useExpensesStore.setState({ expenses: [], hasHydrated: true })
  useCategoriesStore.setState({
    categories: [
      { id: 'cat-1', name: 'Comida', color: '#10B981', icon: '🛒', createdAt: '2026-01-01T00:00:00.000Z' },
    ],
    hasHydrated: true,
  })
  mockNavigate.mockClear()
})

function renderPage(periodId: string) {
  return render(
    <MemoryRouter initialEntries={[`/history/${periodId}/summary`]}>
      <Routes>
        <Route path="/history/:periodId/summary" element={<PeriodSummaryPage />} />
        <Route path="/history" element={<div>History page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PeriodSummaryPage', () => {
  it('redirects to /history when period does not exist', () => {
    renderPage('nonexistent-id')
    expect(mockNavigate).toHaveBeenCalledWith('/history', { replace: true })
  })

  it('shows period title in header', () => {
    act(() => {
      usePeriodsStore.getState().createPeriod({ month: 6, year: 2026, netSalary: 2000 })
    })
    const period = usePeriodsStore.getState().periods[0]
    renderPage(period.id)
    expect(screen.getByText(/Resumen · Junio 2026/i)).toBeInTheDocument()
  })

  it('shows total stats', () => {
    act(() => {
      usePeriodsStore.getState().createPeriod({ month: 6, year: 2026, netSalary: 2000 })
    })
    const period = usePeriodsStore.getState().periods[0]
    act(() => {
      useExpensesStore.getState().addExpense({
        periodId: period.id,
        categoryId: 'cat-1',
        description: 'Test',
        amount: 500,
        date: '2026-06-01',
      })
    })
    renderPage(period.id)
    expect(screen.getAllByText(/500,00/).length).toBeGreaterThanOrEqual(1)
  })

  it('shows "Este período aún está en curso" when it is the latest period', () => {
    act(() => {
      usePeriodsStore.getState().createPeriod({ month: 6, year: 2026, netSalary: 2000 })
    })
    const period = usePeriodsStore.getState().periods[0]
    renderPage(period.id)
    expect(screen.getByText(/este período aún está en curso/i)).toBeInTheDocument()
  })

  it('does NOT show "en curso" notice for a finished period', () => {
    act(() => {
      usePeriodsStore.getState().createPeriod({ month: 5, year: 2026, netSalary: 2000 })
      usePeriodsStore.getState().createPeriod({ month: 6, year: 2026, netSalary: 2000 })
    })
    const mayPeriod = usePeriodsStore.getState().periods.find((p) => p.month === 5)!
    renderPage(mayPeriod.id)
    expect(screen.queryByText(/este período aún está en curso/i)).toBeNull()
  })

  it('accordion: day row is visible, expenses hidden by default, click expands', () => {
    act(() => {
      usePeriodsStore.getState().createPeriod({ month: 6, year: 2026, netSalary: 2000 })
    })
    const period = usePeriodsStore.getState().periods[0]
    act(() => {
      useExpensesStore.getState().addExpense({
        periodId: period.id,
        categoryId: 'cat-1',
        description: 'Cena restaurante',
        amount: 45,
        date: '2026-06-03',
      })
    })
    renderPage(period.id)

    // Day row visible (should show amount)
    expect(screen.getAllByText(/45,00/).length).toBeGreaterThanOrEqual(1)

    // Description appears in Highlights but NOT in the accordion (collapsed)
    const beforeExpand = screen.getAllByText('Cena restaurante')
    // it appears in the highlights "Gasto inesperado más alto" section
    expect(beforeExpand.length).toBe(1)

    // Click the day row to expand
    const dayRow = screen.getByRole('button', { name: /45,00/i })
    fireEvent.click(dayRow)

    // Description visible in accordion too after expand — now 2 occurrences
    expect(screen.getAllByText('Cena restaurante').length).toBe(2)
  })

  it('back link navigates to /history', () => {
    act(() => {
      usePeriodsStore.getState().createPeriod({ month: 6, year: 2026, netSalary: 2000 })
    })
    const period = usePeriodsStore.getState().periods[0]
    renderPage(period.id)
    const backLink = screen.getByRole('link', { name: /volver al historial/i })
    expect(backLink).toHaveAttribute('href', '/history')
  })
})
