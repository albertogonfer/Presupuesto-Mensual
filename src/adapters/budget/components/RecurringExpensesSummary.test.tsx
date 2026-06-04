import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

const mockCancelRecurringExpense = vi.fn()

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

function mockRecurringStore(expenses: RecurringExpense[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(useRecurringExpensesStore).mockImplementation((selector: any) =>
    selector({ recurringExpenses: expenses, cancelRecurringExpense: mockCancelRecurringExpense }),
  )
}

function mockPeriodsStore() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(usePeriodsStore).mockImplementation((selector: any) =>
    selector({ activePeriodId: 'period-1', periods: [{ id: 'period-1', month: 6, year: 2025, netSalary: 2000, createdAt: '' }] }),
  )
}

function renderComponent() {
  return render(
    <MemoryRouter>
      <RecurringExpensesSummary />
    </MemoryRouter>,
  )
}

describe('RecurringExpensesSummary', () => {
  beforeEach(() => {
    mockCancelRecurringExpense.mockClear()
    vi.mocked(useCategories).mockReturnValue({
      categories: [mockCategory],
      addCategory: vi.fn(),
      updateCategory: vi.fn(),
      removeCategory: vi.fn(),
    })
    mockPeriodsStore()
  })

  it('shows list of active recurring expenses', () => {
    mockRecurringStore([mockRecurringActive])
    renderComponent()
    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText(/12,99/)).toBeInTheDocument()
  })

  it('shows "Sin vencimiento" when no expiry is set', () => {
    mockRecurringStore([mockRecurringActive])
    renderComponent()
    expect(screen.getByText('Sin vencimiento')).toBeInTheDocument()
  })

  it('shows remaining label when endsAfter is set', () => {
    mockRecurringStore([mockRecurringWithExpiry])
    renderComponent()
    expect(screen.getByText('Quedan 2 pagos')).toBeInTheDocument()
  })

  it('shows empty state when no active recurring expenses', () => {
    mockRecurringStore([])
    renderComponent()
    expect(screen.getByText(/No hay gastos recurrentes activos/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Añade uno en la sección Recurrentes/ })).toBeInTheDocument()
  })

  it('does not show inactive recurring expenses', () => {
    mockRecurringStore([{ ...mockRecurringActive, active: false }])
    renderComponent()
    expect(screen.queryByText('Netflix')).not.toBeInTheDocument()
    expect(screen.getByText(/No hay gastos recurrentes activos/)).toBeInTheDocument()
  })

  it('shows cancel button and calls cancelRecurringExpense on confirm', () => {
    mockRecurringStore([mockRecurringActive])
    renderComponent()
    fireEvent.click(screen.getByRole('button', { name: /Cancelar Netflix/ }))
    expect(screen.getByText(/¿Cancelar gasto recurrente\?/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Eliminar/ }))
    expect(mockCancelRecurringExpense).toHaveBeenCalledWith('rec-1')
  })
})
