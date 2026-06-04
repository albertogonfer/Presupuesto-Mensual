import { describe, it, expect } from 'vitest'
import {
  shouldGenerateForPeriod,
  isExpiredForPeriod,
  getRemainingLabel,
  buildExpensesForPeriod,
  getMonthlyBalloonReserve,
} from '@/domain/budget/services/recurringExpenseService'
import type { RecurringExpense, BudgetPeriod } from '@/domain/budget/model/types'

function makeRecurring(overrides: Partial<RecurringExpense> = {}): RecurringExpense {
  return {
    id: 'rec-1',
    categoryId: 'cat-1',
    description: 'Netflix',
    amount: 12.99,
    frequency: 'monthly',
    every: 1,
    occurrenceCount: 0,
    createdAt: '2025-01-01T00:00:00.000Z', // created Jan 2025
    active: true,
    ...overrides,
  }
}

function makePeriod(overrides: Partial<BudgetPeriod> = {}): BudgetPeriod {
  return {
    id: 'period-1',
    month: 6,
    year: 2025,
    netSalary: 2000,
    createdAt: '2025-06-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('isExpiredForPeriod', () => {
  it('returns false when no expiry set', () => {
    const r = makeRecurring()
    expect(isExpiredForPeriod(r, 6, 2025)).toBe(false)
  })

  it('returns true when endsAfter reached', () => {
    const r = makeRecurring({ endsAfter: 3, occurrenceCount: 3 })
    expect(isExpiredForPeriod(r, 6, 2025)).toBe(true)
  })

  it('returns false when endsAfter not yet reached', () => {
    const r = makeRecurring({ endsAfter: 3, occurrenceCount: 2 })
    expect(isExpiredForPeriod(r, 6, 2025)).toBe(false)
  })

  it('returns true when endsAt is before period first day', () => {
    const r = makeRecurring({ endsAt: '2025-05-01' })
    expect(isExpiredForPeriod(r, 6, 2025)).toBe(true)
  })

  it('returns false when endsAt is same as period first day', () => {
    const r = makeRecurring({ endsAt: '2025-06-01' })
    expect(isExpiredForPeriod(r, 6, 2025)).toBe(false)
  })

  it('returns false when endsAt is in the future', () => {
    const r = makeRecurring({ endsAt: '2025-12-01' })
    expect(isExpiredForPeriod(r, 6, 2025)).toBe(false)
  })
})

describe('shouldGenerateForPeriod', () => {
  it('monthly every 1: returns true when not expired', () => {
    const r = makeRecurring({ frequency: 'monthly', every: 1 })
    expect(shouldGenerateForPeriod(r, 6, 2025)).toBe(true)
  })

  it('monthly every 1: returns false when expired by endsAt', () => {
    const r = makeRecurring({ frequency: 'monthly', every: 1, endsAt: '2025-05-01' })
    expect(shouldGenerateForPeriod(r, 6, 2025)).toBe(false)
  })

  it('monthly every 1: returns false when expired by endsAfter', () => {
    const r = makeRecurring({ frequency: 'monthly', every: 1, endsAfter: 2, occurrenceCount: 2 })
    expect(shouldGenerateForPeriod(r, 6, 2025)).toBe(false)
  })

  it('monthly every 2: returns true on even month offset', () => {
    // created Jan 2025. Jun 2025 is 5 months later → 5 % 2 ≠ 0 → false
    const r = makeRecurring({ frequency: 'monthly', every: 2 })
    expect(shouldGenerateForPeriod(r, 6, 2025)).toBe(false)
  })

  it('monthly every 2: returns true on odd month offset', () => {
    // Feb 2025 is 1 month later → 1 % 2 ≠ 0 → false
    // Mar 2025 is 2 months later → 2 % 2 = 0 → true
    const r = makeRecurring({ frequency: 'monthly', every: 2 })
    expect(shouldGenerateForPeriod(r, 3, 2025)).toBe(true)
  })

  it('returns false when inactive', () => {
    const r = makeRecurring({ active: false })
    expect(shouldGenerateForPeriod(r, 6, 2025)).toBe(false)
  })

  it('yearly: returns true on anniversary month/year', () => {
    const r = makeRecurring({ frequency: 'yearly', every: 1 })
    // created Jan 2025, check Jan 2026
    expect(shouldGenerateForPeriod(r, 1, 2026)).toBe(true)
  })

  it('yearly: returns false on wrong month', () => {
    const r = makeRecurring({ frequency: 'yearly', every: 1 })
    expect(shouldGenerateForPeriod(r, 6, 2026)).toBe(false)
  })
})

describe('getRemainingLabel', () => {
  it('returns null when indefinite (no endsAt or endsAfter)', () => {
    const r = makeRecurring()
    expect(getRemainingLabel(r, 6, 2025)).toBeNull()
  })

  it('returns "Queda 1 pago" when 1 remaining', () => {
    const r = makeRecurring({ endsAfter: 3, occurrenceCount: 2 })
    expect(getRemainingLabel(r, 6, 2025)).toBe('Queda 1 pago')
  })

  it('returns "Quedan N pagos" when multiple remaining', () => {
    const r = makeRecurring({ endsAfter: 5, occurrenceCount: 2 })
    expect(getRemainingLabel(r, 6, 2025)).toBe('Quedan 3 pagos')
  })

  it('returns "Finalizado" when endsAfter exhausted', () => {
    const r = makeRecurring({ endsAfter: 3, occurrenceCount: 3 })
    expect(getRemainingLabel(r, 6, 2025)).toBe('Finalizado')
  })

  it('returns "Vence el dd/mm/yyyy" for future endsAt', () => {
    const r = makeRecurring({ endsAt: '2025-12-15' })
    expect(getRemainingLabel(r, 6, 2025)).toBe('Vence el 15/12/2025')
  })

  it('returns "Venció en mes año" for past endsAt', () => {
    const r = makeRecurring({ endsAt: '2025-03-01' })
    const label = getRemainingLabel(r, 6, 2025)
    expect(label).toBe('Venció en marzo 2025')
  })
})

describe('buildExpensesForPeriod', () => {
  it('generates expenses for non-expired active recurring expenses', () => {
    const period = makePeriod()
    const recurring = makeRecurring()
    const expenses = buildExpensesForPeriod(period, [recurring])
    expect(expenses).toHaveLength(1)
    expect(expenses[0].periodId).toBe('period-1')
    expect(expenses[0].categoryId).toBe('cat-1')
    expect(expenses[0].description).toBe('🔁 Netflix')
    expect(expenses[0].amount).toBe(12.99)
    expect(expenses[0].date).toBe('2025-06-01')
  })

  it('does not generate expenses for expired recurring', () => {
    const period = makePeriod()
    const recurring = makeRecurring({ endsAfter: 3, occurrenceCount: 3 })
    const expenses = buildExpensesForPeriod(period, [recurring])
    expect(expenses).toHaveLength(0)
  })

  it('does not generate expenses for inactive recurring', () => {
    const period = makePeriod()
    const recurring = makeRecurring({ active: false })
    const expenses = buildExpensesForPeriod(period, [recurring])
    expect(expenses).toHaveLength(0)
  })

  it('generates multiple expenses for multiple active recurring', () => {
    const period = makePeriod()
    const rec1 = makeRecurring({ id: 'rec-1', description: 'Netflix' })
    const rec2 = makeRecurring({ id: 'rec-2', description: 'Spotify' })
    const expenses = buildExpensesForPeriod(period, [rec1, rec2])
    expect(expenses).toHaveLength(2)
  })

  it('sets date to first day of the period month', () => {
    const period = makePeriod({ month: 3, year: 2025 })
    const recurring = makeRecurring()
    const expenses = buildExpensesForPeriod(period, [recurring])
    expect(expenses[0].date).toBe('2025-03-01')
  })
})

describe('getMonthlyBalloonReserve', () => {
  it('returns 0 when no finalPaymentAmount', () => {
    const r = makeRecurring({ endsAfter: 6, occurrenceCount: 0 })
    expect(getMonthlyBalloonReserve(r, 6, 2025)).toBe(0)
  })

  it('endsAfter with 6 remaining → finalPaymentAmount / 6', () => {
    const r = makeRecurring({ endsAfter: 6, occurrenceCount: 0, finalPaymentAmount: 1200 })
    // remaining = 6 - 0 = 6
    expect(getMonthlyBalloonReserve(r, 6, 2025)).toBeCloseTo(200, 5)
  })

  it('remainingOccurrences = 1 → returns finalPaymentAmount', () => {
    const r = makeRecurring({ endsAfter: 5, occurrenceCount: 4, finalPaymentAmount: 1200 })
    // remaining = 5 - 4 = 1
    expect(getMonthlyBalloonReserve(r, 6, 2025)).toBe(1200)
  })

  it('remainingOccurrences <= 0 → returns finalPaymentAmount', () => {
    const r = makeRecurring({ endsAfter: 3, occurrenceCount: 3, finalPaymentAmount: 1200 })
    // remaining = 0
    expect(getMonthlyBalloonReserve(r, 6, 2025)).toBe(1200)
  })

  it('endsAt: estimates remaining months correctly', () => {
    // endsAt = 2026-06-01 → from June 2025 → 12 months remaining
    const r = makeRecurring({ endsAt: '2026-06-01', finalPaymentAmount: 1200 })
    expect(getMonthlyBalloonReserve(r, 6, 2025)).toBeCloseTo(100, 5)
  })

  it('returns 0 when neither endsAt nor endsAfter (indefinite)', () => {
    const r = makeRecurring({ finalPaymentAmount: 1200 })
    expect(getMonthlyBalloonReserve(r, 6, 2025)).toBe(0)
  })
})
