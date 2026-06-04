import { describe, it, expect } from 'vitest'
import { calculateSummary } from './calculateSummary'
import type { BudgetPeriod, Expense, Category } from '../model/types'

const makeCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 'cat-1',
  name: 'Comida',
  color: '#10B981',
  icon: '🛒',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

const makePeriod = (overrides: Partial<BudgetPeriod> = {}): BudgetPeriod => ({
  id: 'period-1',
  month: 6,
  year: 2026,
  netSalary: 1000,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

const makeExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: 'exp-1',
  periodId: 'period-1',
  categoryId: 'cat-1',
  description: 'Mercadona',
  amount: 100,
  date: '2026-06-01',
  createdAt: '2026-06-01T00:00:00.000Z',
  ...overrides,
})

describe('calculateSummary', () => {
  it('returns correct totalSpent, remaining, percentUsed for basic case (spec: salary=1000, expenses=600 → remaining=400)', () => {
    const period = makePeriod({ netSalary: 1000 })
    const categories = [makeCategory()]
    const expenses = [
      makeExpense({ amount: 300 }),
      makeExpense({ id: 'exp-2', amount: 300 }),
    ]
    const result = calculateSummary(period, expenses, categories)
    expect(result.totalSpent).toBe(600)
    expect(result.remaining).toBe(400)
    expect(result.percentUsed).toBeCloseTo(60, 1)
  })

  it('returns empty byCategory when no expenses', () => {
    const period = makePeriod()
    const result = calculateSummary(period, [], [makeCategory()])
    expect(result.byCategory).toHaveLength(0)
    expect(result.totalSpent).toBe(0)
    expect(result.remaining).toBe(1000)
    expect(result.percentUsed).toBe(0)
  })

  it('groups expenses by category and computes percentage per category', () => {
    const catA = makeCategory({ id: 'cat-a', name: 'Comida' })
    const catB = makeCategory({ id: 'cat-b', name: 'Moto' })
    const period = makePeriod({ netSalary: 1000 })
    const expenses = [
      makeExpense({ id: 'e1', categoryId: 'cat-a', amount: 600 }),
      makeExpense({ id: 'e2', categoryId: 'cat-b', amount: 200 }),
      makeExpense({ id: 'e3', categoryId: 'cat-a', amount: 200 }),
    ]
    const result = calculateSummary(period, expenses, [catA, catB])
    // byCategory sorted by total desc
    expect(result.byCategory[0].category.id).toBe('cat-a')
    expect(result.byCategory[0].total).toBe(800)
    expect(result.byCategory[0].percentage).toBeCloseTo(80, 1)
    expect(result.byCategory[1].category.id).toBe('cat-b')
    expect(result.byCategory[1].total).toBe(200)
    expect(result.byCategory[1].percentage).toBeCloseTo(20, 1)
  })

  it('byCategory is sorted by total descending', () => {
    const catA = makeCategory({ id: 'cat-a', name: 'Comida' })
    const catB = makeCategory({ id: 'cat-b', name: 'Moto' })
    const catC = makeCategory({ id: 'cat-c', name: 'Otros' })
    const period = makePeriod({ netSalary: 2000 })
    const expenses = [
      makeExpense({ id: 'e1', categoryId: 'cat-c', amount: 50 }),
      makeExpense({ id: 'e2', categoryId: 'cat-a', amount: 300 }),
      makeExpense({ id: 'e3', categoryId: 'cat-b', amount: 150 }),
    ]
    const result = calculateSummary(period, expenses, [catA, catB, catC])
    const totals = result.byCategory.map((b) => b.total)
    expect(totals).toEqual([300, 150, 50])
  })

  it('excludes categories with zero expenses from byCategory', () => {
    const catA = makeCategory({ id: 'cat-a', name: 'Comida' })
    const catB = makeCategory({ id: 'cat-b', name: 'Moto' })
    const period = makePeriod()
    const expenses = [makeExpense({ categoryId: 'cat-a', amount: 100 })]
    const result = calculateSummary(period, expenses, [catA, catB])
    expect(result.byCategory).toHaveLength(1)
    expect(result.byCategory[0].category.id).toBe('cat-a')
  })

  it('includes savingsGoal and savingsProgress when period has savingsGoal', () => {
    const period = makePeriod({ netSalary: 1000, savingsGoal: 200 })
    const expenses = [makeExpense({ amount: 600 })]
    const result = calculateSummary(period, expenses, [makeCategory()])
    // remaining = 1000 - 600 = 400; savingsProgress = 400 - 200 = 200
    expect(result.savingsGoal).toBe(200)
    expect(result.savingsProgress).toBe(200)
  })

  it('savingsProgress is negative when remaining is less than savingsGoal', () => {
    const period = makePeriod({ netSalary: 1000, savingsGoal: 500 })
    const expenses = [makeExpense({ amount: 700 })]
    const result = calculateSummary(period, expenses, [makeCategory()])
    // remaining = 300; savingsProgress = 300 - 500 = -200
    expect(result.savingsGoal).toBe(500)
    expect(result.savingsProgress).toBe(-200)
  })

  it('savingsGoal and savingsProgress are undefined when period has no savingsGoal', () => {
    const period = makePeriod({ netSalary: 1000 })
    const expenses = [makeExpense({ amount: 300 })]
    const result = calculateSummary(period, expenses, [makeCategory()])
    expect(result.savingsGoal).toBeUndefined()
    expect(result.savingsProgress).toBeUndefined()
  })
})
