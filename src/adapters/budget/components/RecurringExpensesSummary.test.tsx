import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { RecurringExpensesSummary } from './RecurringExpensesSummary'
import type { RecurringExpense, Category } from '../../../domain/budget/model/types'

const mockCategory: Category = {
  id: 'cat-1',
  name: 'Suscripciones',
  color: '#8B5CF6',
  icon: '📺',
  createdAt: '2025-01-01T00:00:00.000Z',
}

const mockRecurringActive: RecurringExpense = {
  id: 'rec-1',
  categoryId: 'cat-1',
  description: 'Netflix',
  amount: 12.99,
  frequency: 'monthly',
  every: 1,
  occurrenceCount: 2,
  createdAt: '2025-01-01T00:00:00.000Z',
  active: true,
}

const mockRecurringWithExpiry: RecurringExpense = {
  id: 'rec-2',
  categoryId: 'cat-1',
  description: 'Gym',
  amount: 30,
  frequency: 'monthly',
  every: 1,
  occurrenceCount: 1,
  endsAfter: 3,
  createdAt: '2025-01-01T00:00:00.000Z',
  active: true,
}

vi.mock('../store/recurringExpensesStore', () => ({
  useRecurringExpensesStore: vi.fn(),
}))

vi.mock('../hooks/useCategories', () => ({
  useCategories: vi.fn(),
}))

vi.mock('../store/periodsStore', () => ({
  usePeriodsStore: vi.fn(),
}))

import { useRecurringExpensesStore } from '../store/recurringExpensesStore'
import { useCategories } from '../hooks/useCategories'
import { usePeriodsStore } from '../store/periodsStore'

function renderComponent() {
  return render(
    <MemoryRouter>
      <RecurringExpensesSummary />
    </MemoryRouter>,
  )
}

describe('RecurringExpensesSummary', () => {
  beforeEach(() => {
    vi.mocked(useCategories).mockReturnValue({
      categories: [mockCategory],
      addCategory: vi.fn(),
      updateCategory: vi.fn(),
      removeCategory: vi.fn(),
    })
    vi.mocked(usePeriodsStore).mockImplementation((selector: (s: unknown) => unknown) => {
      const state = { activePeriodId: 'period-1', periods: [{ id: 'period-1', month: 6, year: 2025, netSalary: 2000, createdAt: '' }] }
      return selector(state)
    })
  })

  it('shows list of active recurring expenses', () => {
    vi.mocked(useRecurringExpensesStore).mockImplementation((selector: (s: unknown) => unknown) => {
      return selector({ recurringExpenses: [mockRecurringActive] })
    })
    renderComponent()
    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText(/12,99/)).toBeInTheDocument()
  })

  it('shows "Sin vencimiento" when no expiry is set', () => {
    vi.mocked(useRecurringExpensesStore).mockImplementation((selector: (s: unknown) => unknown) => {
      return selector({ recurringExpenses: [mockRecurringActive] })
    })
    renderComponent()
    expect(screen.getByText('Sin vencimiento')).toBeInTheDocument()
  })

  it('shows remaining label when endsAfter is set', () => {
    vi.mocked(useRecurringExpensesStore).mockImplementation((selector: (s: unknown) => unknown) => {
      return selector({ recurringExpenses: [mockRecurringWithExpiry] })
    })
    renderComponent()
    expect(screen.getByText('Quedan 2 pagos')).toBeInTheDocument()
  })

  it('shows empty state when no active recurring expenses', () => {
    vi.mocked(useRecurringExpensesStore).mockImplementation((selector: (s: unknown) => unknown) => {
      return selector({ recurringExpenses: [] })
    })
    renderComponent()
    expect(screen.getByText(/No hay gastos recurrentes activos/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Añade uno en la sección Recurrentes/ })).toBeInTheDocument()
  })

  it('does not show inactive recurring expenses', () => {
    const inactive = { ...mockRecurringActive, active: false }
    vi.mocked(useRecurringExpensesStore).mockImplementation((selector: (s: unknown) => unknown) => {
      return selector({ recurringExpenses: [inactive] })
    })
    renderComponent()
    expect(screen.queryByText('Netflix')).not.toBeInTheDocument()
    expect(screen.getByText(/No hay gastos recurrentes activos/)).toBeInTheDocument()
  })
})
