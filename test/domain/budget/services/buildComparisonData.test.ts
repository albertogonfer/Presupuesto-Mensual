import { describe, it, expect } from 'vitest'
import { buildComparisonData } from '@/domain/budget/services/buildComparisonData'
import type { BudgetPeriod, Expense } from '@/domain/budget/model/types'

function makePeriod(overrides: Partial<BudgetPeriod> & { month: number; year: number; netSalary: number }): BudgetPeriod {
  return {
    id: `period-${overrides.month}-${overrides.year}`,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

function makeExpense(periodId: string, amount: number): Expense {
  return {
    id: `expense-${Math.random()}`,
    periodId,
    categoryId: 'cat-1',
    description: 'Test',
    amount,
    date: '2026-01-01',
    createdAt: new Date().toISOString(),
  }
}

describe('buildComparisonData', () => {
  it('returns empty array for empty input', () => {
    expect(buildComparisonData([], [])).toEqual([])
  })

  it('single period: vsLastMonth is undefined', () => {
    const period = makePeriod({ month: 1, year: 2026, netSalary: 2000 })
    const expenses = [makeExpense(period.id, 500)]
    const result = buildComparisonData([period], expenses)
    expect(result).toHaveLength(1)
    expect(result[0].vsLastMonth).toBeUndefined()
  })

  it('two periods: second has correct vsLastMonth diff', () => {
    const p1 = makePeriod({ month: 1, year: 2026, netSalary: 2000 })
    const p2 = makePeriod({ month: 2, year: 2026, netSalary: 2000 })
    const expenses = [
      makeExpense(p1.id, 1000),
      makeExpense(p2.id, 1200),
    ]
    const result = buildComparisonData([p1, p2], expenses)
    expect(result[0].vsLastMonth).toBeUndefined()
    expect(result[1].vsLastMonth).toBe(200) // 1200 - 1000
  })

  it('savingsGoal present: savedVsGoal computed correctly', () => {
    const period = makePeriod({ month: 3, year: 2026, netSalary: 2000, savingsGoal: 400 })
    const expenses = [makeExpense(period.id, 1400)]
    const result = buildComparisonData([period], expenses)
    // remaining = 2000 - 1400 = 600; savedVsGoal = 600 - 400 = 200
    expect(result[0].savedVsGoal).toBe(200)
  })

  it('sorted chronologically regardless of input order', () => {
    const p1 = makePeriod({ month: 6, year: 2026, netSalary: 2000 })
    const p2 = makePeriod({ month: 1, year: 2026, netSalary: 2000 })
    const p3 = makePeriod({ month: 3, year: 2026, netSalary: 2000 })
    const result = buildComparisonData([p1, p2, p3], [])
    expect(result[0].label).toContain('Enero')
    expect(result[1].label).toContain('Marzo')
    expect(result[2].label).toContain('Junio')
  })

  it('vsLastMonth is negative when spending decreased', () => {
    const p1 = makePeriod({ month: 1, year: 2026, netSalary: 2000 })
    const p2 = makePeriod({ month: 2, year: 2026, netSalary: 2000 })
    const expenses = [
      makeExpense(p1.id, 1500),
      makeExpense(p2.id, 900),
    ]
    const result = buildComparisonData([p1, p2], expenses)
    expect(result[1].vsLastMonth).toBe(-600)
  })
})
