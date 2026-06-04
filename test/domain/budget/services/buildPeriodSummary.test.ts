import { describe, it, expect } from 'vitest'
import { buildPeriodSummary } from '@/domain/budget/services/buildPeriodSummary'
import type { BudgetPeriod, Expense, Category } from '@/domain/budget/model/types'

function makePeriod(id: string, month: number, year: number, netSalary = 2000): BudgetPeriod {
  return { id, month, year, netSalary, createdAt: '2026-01-01T00:00:00.000Z' }
}

function makeExpense(
  id: string,
  periodId: string,
  amount: number,
  date: string,
  categoryId = 'cat-1',
  description = 'Test expense',
): Expense {
  return { id, periodId, categoryId, description, amount, date, createdAt: '2026-01-01T00:00:00.000Z' }
}

function makeCategory(id: string, name: string): Category {
  return { id, name, color: '#000000', icon: '📦', createdAt: '2026-01-01T00:00:00.000Z' }
}

const cat1 = makeCategory('cat-1', 'Comida')
const cat2 = makeCategory('cat-2', 'Moto')
const categories = [cat1, cat2]

describe('buildPeriodSummary', () => {
  it('computes totalSpent, remaining, percentUsed correctly', () => {
    const period = makePeriod('p1', 6, 2026, 2000)
    const expenses = [
      makeExpense('e1', 'p1', 300, '2026-06-01'),
      makeExpense('e2', 'p1', 200, '2026-06-02'),
    ]
    const result = buildPeriodSummary(period, expenses, categories, [period], expenses)
    expect(result.totalSpent).toBe(500)
    expect(result.remaining).toBe(1500)
    expect(result.percentUsed).toBeCloseTo(25)
  })

  it('only considers expenses for the given period', () => {
    const p1 = makePeriod('p1', 6, 2026, 2000)
    const p2 = makePeriod('p2', 7, 2026, 2000)
    const expenses = [
      makeExpense('e1', 'p1', 500, '2026-06-01'),
      makeExpense('e2', 'p2', 999, '2026-07-01'),
    ]
    const result = buildPeriodSummary(p1, expenses, categories, [p1, p2], expenses)
    expect(result.totalSpent).toBe(500)
  })

  it('topSpendingDays returns top 3 sorted by total desc', () => {
    const period = makePeriod('p1', 6, 2026, 2000)
    const expenses = [
      makeExpense('e1', 'p1', 10, '2026-06-01'),
      makeExpense('e2', 'p1', 50, '2026-06-02'),
      makeExpense('e3', 'p1', 30, '2026-06-03'),
      makeExpense('e4', 'p1', 80, '2026-06-04'),
      makeExpense('e5', 'p1', 5, '2026-06-05'),
    ]
    const result = buildPeriodSummary(period, expenses, categories, [period], expenses)
    expect(result.topSpendingDays).toHaveLength(3)
    expect(result.topSpendingDays[0].total).toBe(80)
    expect(result.topSpendingDays[1].total).toBe(50)
    expect(result.topSpendingDays[2].total).toBe(30)
  })

  it('biggestUnexpected excludes 🔁 expenses', () => {
    const period = makePeriod('p1', 6, 2026, 2000)
    const expenses = [
      makeExpense('e1', 'p1', 500, '2026-06-01', 'cat-1', '🔁 Alquiler'),
      makeExpense('e2', 'p1', 200, '2026-06-02', 'cat-1', 'Cena restaurante'),
      makeExpense('e3', 'p1', 100, '2026-06-03', 'cat-1', 'Gasolina'),
    ]
    const result = buildPeriodSummary(period, expenses, categories, [period], expenses)
    expect(result.biggestUnexpected?.description).toBe('Cena restaurante')
    expect(result.biggestUnexpected?.amount).toBe(200)
  })

  it('biggestUnexpected is null when all expenses are recurring', () => {
    const period = makePeriod('p1', 6, 2026, 2000)
    const expenses = [
      makeExpense('e1', 'p1', 500, '2026-06-01', 'cat-1', '🔁 Alquiler'),
    ]
    const result = buildPeriodSummary(period, expenses, categories, [period], expenses)
    expect(result.biggestUnexpected).toBeNull()
  })

  it('mostExpensiveCategory returns correct category', () => {
    const period = makePeriod('p1', 6, 2026, 2000)
    const expenses = [
      makeExpense('e1', 'p1', 300, '2026-06-01', 'cat-1'),
      makeExpense('e2', 'p1', 100, '2026-06-02', 'cat-1'),
      makeExpense('e3', 'p1', 500, '2026-06-03', 'cat-2'),
    ]
    const result = buildPeriodSummary(period, expenses, categories, [period], expenses)
    expect(result.mostExpensiveCategory?.category.id).toBe('cat-2')
    expect(result.mostExpensiveCategory?.total).toBe(500)
  })

  it('mostExpensiveCategory is null when no expenses', () => {
    const period = makePeriod('p1', 6, 2026, 2000)
    const result = buildPeriodSummary(period, [], categories, [period], [])
    expect(result.mostExpensiveCategory).toBeNull()
  })

  it('vsLastMonth is null when no previous period', () => {
    const period = makePeriod('p1', 6, 2026, 2000)
    const result = buildPeriodSummary(period, [], categories, [period], [])
    expect(result.vsLastMonth).toBeNull()
  })

  it('vsLastMonth is correct when previous period exists', () => {
    const p1 = makePeriod('p1', 5, 2026, 2000)
    const p2 = makePeriod('p2', 6, 2026, 2000)
    const allExpenses = [
      makeExpense('e1', 'p1', 800, '2026-05-15'),
      makeExpense('e2', 'p2', 600, '2026-06-15'),
    ]
    const result = buildPeriodSummary(p2, allExpenses, categories, [p1, p2], allExpenses)
    expect(result.vsLastMonth).not.toBeNull()
    expect(result.vsLastMonth?.totalSpent).toBe(800)
    expect(result.vsLastMonth?.remaining).toBe(1200)
    expect(result.vsLastMonth?.label).toBe('Mayo 2026')
  })

  it('dailyBreakdown contains all days with expenses, sorted chronologically', () => {
    const period = makePeriod('p1', 6, 2026, 2000)
    const expenses = [
      makeExpense('e1', 'p1', 50, '2026-06-03'),
      makeExpense('e2', 'p1', 20, '2026-06-01'),
      makeExpense('e3', 'p1', 30, '2026-06-01'),
    ]
    const result = buildPeriodSummary(period, expenses, categories, [period], expenses)
    expect(result.dailyBreakdown).toHaveLength(2)
    expect(result.dailyBreakdown[0].date).toBe('2026-06-01')
    expect(result.dailyBreakdown[0].total).toBe(50)
    expect(result.dailyBreakdown[1].date).toBe('2026-06-03')
    expect(result.dailyBreakdown[1].total).toBe(50)
  })

  it('dailyBreakdown expenses sorted by amount desc within each day', () => {
    const period = makePeriod('p1', 6, 2026, 2000)
    const expenses = [
      makeExpense('e1', 'p1', 10, '2026-06-01'),
      makeExpense('e2', 'p1', 80, '2026-06-01'),
      makeExpense('e3', 'p1', 40, '2026-06-01'),
    ]
    const result = buildPeriodSummary(period, expenses, categories, [period], expenses)
    const day = result.dailyBreakdown[0]
    expect(day.expenses[0].amount).toBe(80)
    expect(day.expenses[1].amount).toBe(40)
    expect(day.expenses[2].amount).toBe(10)
  })
})
