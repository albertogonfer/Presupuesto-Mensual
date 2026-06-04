import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { usePeriodsStore } from '@/adapters/budget/store/periodsStore'
import { useExpensesStore } from '@/adapters/budget/store/expensesStore'
import { useCategoriesStore } from '@/adapters/budget/store/categoriesStore'
import PeriodSummaryPage from '@/adapters/budget/pages/PeriodSummaryPage'
import type { BudgetPeriod, Expense } from '@/domain/budget/model/types'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

function makePeriod(id: string, month: number, year: number, netSalary: number): BudgetPeriod {
  return { id, month, year, netSalary, createdAt: `${year}-${String(month).padStart(2, '0')}-01T00:00:00Z` }
}

function makeExpense(id: string, periodId: string, amount: number, description: string, date: string): Expense {
  return { id, periodId, categoryId: 'cat-1', description, amount, date, createdAt: `${date}T00:00:00Z` }
}

beforeEach(() => {
  usePeriodsStore.setState({ periods: [], activePeriodId: null })
  useExpensesStore.setState({ expenses: [] })
  useCategoriesStore.setState({
    categories: [
      { id: 'cat-1', name: 'Comida', color: '#10B981', icon: '🛒', createdAt: '2026-01-01T00:00:00.000Z' },
    ],
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
    const period = makePeriod('jun-2026', 6, 2026, 2000)
    usePeriodsStore.setState({ periods: [period], activePeriodId: period.id })
    renderPage(period.id)
    expect(screen.getByText(/Resumen · Junio 2026/i)).toBeInTheDocument()
  })

  it('shows total stats', () => {
    const period = makePeriod('jun-2026', 6, 2026, 2000)
    usePeriodsStore.setState({ periods: [period], activePeriodId: period.id })
    useExpensesStore.setState({
      expenses: [makeExpense('e1', period.id, 500, 'Test', '2026-06-01')],
    })
    renderPage(period.id)
    expect(screen.getAllByText(/500,00/).length).toBeGreaterThanOrEqual(1)
  })

  it('shows "Este período aún está en curso" when it is the latest period', () => {
    const period = makePeriod('jun-2026', 6, 2026, 2000)
    usePeriodsStore.setState({ periods: [period], activePeriodId: period.id })
    renderPage(period.id)
    expect(screen.getByText(/este período aún está en curso/i)).toBeInTheDocument()
  })

  it('does NOT show "en curso" notice for a finished period', () => {
    const may = makePeriod('may-2026', 5, 2026, 2000)
    const jun = makePeriod('jun-2026', 6, 2026, 2000)
    usePeriodsStore.setState({ periods: [may, jun], activePeriodId: jun.id })
    renderPage(may.id)
    expect(screen.queryByText(/este período aún está en curso/i)).toBeNull()
  })

  it('accordion: day row is visible, expenses hidden by default, click expands', () => {
    const period = makePeriod('jun-2026', 6, 2026, 2000)
    usePeriodsStore.setState({ periods: [period], activePeriodId: period.id })
    useExpensesStore.setState({
      expenses: [makeExpense('e1', period.id, 45, 'Cena restaurante', '2026-06-03')],
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
    const period = makePeriod('jun-2026', 6, 2026, 2000)
    usePeriodsStore.setState({ periods: [period], activePeriodId: period.id })
    renderPage(period.id)
    const backLink = screen.getByRole('link', { name: /volver al historial/i })
    expect(backLink).toHaveAttribute('href', '/history')
  })
})
