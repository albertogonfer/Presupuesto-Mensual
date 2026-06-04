import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { RecurringExpiryBanner } from './RecurringExpiryBanner'
import type { RecurringExpense } from '../../../domain/budget/model/types'

vi.mock('../store/recurringExpensesStore', () => ({
  useRecurringExpensesStore: vi.fn(),
}))

vi.mock('../store/periodsStore', () => ({
  usePeriodsStore: vi.fn(),
}))

import { useRecurringExpensesStore } from '../store/recurringExpensesStore'
import { usePeriodsStore } from '../store/periodsStore'

const activePeriod = {
  id: 'period-1',
  month: 6,
  year: 2025,
  netSalary: 2000,
  createdAt: '2025-06-01T00:00:00.000Z',
}

function makeRecurring(overrides: Partial<RecurringExpense> = {}): RecurringExpense {
  return {
    id: 'rec-1',
    categoryId: 'cat-1',
    description: 'Netflix',
    amount: 12.99,
    frequency: 'monthly',
    every: 1,
    occurrenceCount: 3,
    endsAfter: 3, // expired: occurrenceCount >= endsAfter
    createdAt: '2025-01-01T00:00:00.000Z',
    active: true,
    ...overrides,
  }
}

function mockPeriodsStore() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(usePeriodsStore).mockImplementation((selector: any) =>
    selector({ activePeriodId: 'period-1', periods: [activePeriod] }),
  )
}

function mockRecurringStore(expenses: RecurringExpense[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(useRecurringExpensesStore).mockImplementation((selector: any) =>
    selector({ recurringExpenses: expenses }),
  )
}

function renderBanner() {
  return render(
    <MemoryRouter>
      <RecurringExpiryBanner />
    </MemoryRouter>,
  )
}

describe('RecurringExpiryBanner', () => {
  beforeEach(() => {
    localStorage.clear()
    mockPeriodsStore()
  })

  it('is hidden when no expired recurring expenses', () => {
    mockRecurringStore([makeRecurring({ occurrenceCount: 1 })])
    renderBanner()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows names of expired recurring expenses', () => {
    mockRecurringStore([makeRecurring()])
    renderBanner()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Netflix')).toBeInTheDocument()
  })

  it('shows multiple expired names', () => {
    mockRecurringStore([
      makeRecurring({ id: 'rec-1', description: 'Netflix' }),
      makeRecurring({ id: 'rec-2', description: 'Seguro moto' }),
    ])
    renderBanner()
    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('Seguro moto')).toBeInTheDocument()
  })

  it('dismisses the banner on X click', async () => {
    mockRecurringStore([makeRecurring()])
    renderBanner()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /cerrar aviso/i }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('is hidden when recurring has occurrenceCount 0 (never ran)', () => {
    mockRecurringStore([makeRecurring({ occurrenceCount: 0 })])
    renderBanner()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
