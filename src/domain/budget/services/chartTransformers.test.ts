import { describe, it, expect } from 'vitest'
import { buildPieData, buildBarData, buildDailyCumulativeData } from './chartTransformers'
import type { BudgetSummary, BudgetPeriod, Expense, Category } from '../model/types'

const catFood: Category = {
  id: 'cat-1',
  name: 'Comida',
  color: '#10B981',
  icon: '🍔',
  createdAt: '2026-01-01T00:00:00.000Z',
}

const catLoan: Category = {
  id: 'cat-2',
  name: 'Préstamos',
  color: '#F59E0B',
  icon: '💳',
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('buildPieData', () => {
  it('maps byCategory to PieChartData with name, value, fill', () => {
    const summary: BudgetSummary = {
      totalSpent: 300,
      remaining: 700,
      percentUsed: 30,
      byCategory: [
        { category: catFood, total: 200, percentage: 66.67 },
        { category: catLoan, total: 100, percentage: 33.33 },
      ],
    }

    const result = buildPieData(summary)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ name: 'Comida', value: 200, fill: '#10B981' })
    expect(result[1]).toEqual({ name: 'Préstamos', value: 100, fill: '#F59E0B' })
  })

  it('returns empty array when byCategory is empty', () => {
    const summary: BudgetSummary = {
      totalSpent: 0,
      remaining: 1000,
      percentUsed: 0,
      byCategory: [],
    }

    expect(buildPieData(summary)).toEqual([])
  })

  it('uses category color as fill', () => {
    const summary: BudgetSummary = {
      totalSpent: 100,
      remaining: 900,
      percentUsed: 10,
      byCategory: [{ category: catFood, total: 100, percentage: 100 }],
    }

    const result = buildPieData(summary)
    expect(result[0].fill).toBe('#10B981')
  })
})

describe('buildBarData', () => {
  const periodJan: BudgetPeriod = {
    id: 'p-jan',
    month: 1,
    year: 2026,
    netSalary: 2000,
    createdAt: '2026-01-01T00:00:00.000Z',
  }
  const periodFeb: BudgetPeriod = {
    id: 'p-feb',
    month: 2,
    year: 2026,
    netSalary: 2500,
    createdAt: '2026-02-01T00:00:00.000Z',
  }
  const periodMar: BudgetPeriod = {
    id: 'p-mar',
    month: 3,
    year: 2026,
    netSalary: 2200,
    createdAt: '2026-03-01T00:00:00.000Z',
  }

  const expenses: Expense[] = [
    { id: 'e-1', periodId: 'p-jan', categoryId: 'cat-1', description: 'Mercado', amount: 800, date: '2026-01-10', createdAt: '2026-01-10T00:00:00.000Z' },
    { id: 'e-2', periodId: 'p-jan', categoryId: 'cat-2', description: 'Cuota', amount: 400, date: '2026-01-15', createdAt: '2026-01-15T00:00:00.000Z' },
    { id: 'e-3', periodId: 'p-feb', categoryId: 'cat-1', description: 'Super', amount: 900, date: '2026-02-05', createdAt: '2026-02-05T00:00:00.000Z' },
  ]

  it('returns one entry per period sorted chronologically', () => {
    const result = buildBarData([periodMar, periodJan, periodFeb], expenses)

    expect(result).toHaveLength(3)
    expect(result[0].month).toBe('ene 2026')
    expect(result[1].month).toBe('feb 2026')
    expect(result[2].month).toBe('mar 2026')
  })

  it('sums expenses belonging to each period', () => {
    const result = buildBarData([periodJan, periodFeb], expenses)

    expect(result[0].gastado).toBe(1200)   // 800 + 400
    expect(result[1].gastado).toBe(900)
  })

  it('uses netSalary as presupuesto', () => {
    const result = buildBarData([periodJan, periodFeb], expenses)

    expect(result[0].presupuesto).toBe(2000)
    expect(result[1].presupuesto).toBe(2500)
  })

  it('returns 0 gastado for a period with no expenses', () => {
    const result = buildBarData([periodMar], expenses)

    expect(result[0].gastado).toBe(0)
    expect(result[0].presupuesto).toBe(2200)
  })

  it('returns empty array when no periods given', () => {
    expect(buildBarData([], expenses)).toEqual([])
  })

  it('formats month label as abbreviated month + year (es-ES)', () => {
    const result = buildBarData([periodJan], expenses)
    // es-ES short month for January = "ene"
    expect(result[0].month).toMatch(/^ene 2026$/i)
  })
})

describe('buildDailyCumulativeData', () => {
  const period: BudgetPeriod = {
    id: 'p-jan',
    month: 1,
    year: 2026,
    netSalary: 2000,
    createdAt: '2026-01-01T00:00:00.000Z',
  }

  const expenses: Expense[] = [
    { id: 'e-1', periodId: 'p-jan', categoryId: 'cat-1', description: 'Mercado', amount: 100, date: '2026-01-05', createdAt: '2026-01-05T00:00:00.000Z' },
    { id: 'e-2', periodId: 'p-jan', categoryId: 'cat-1', description: 'Cuota',   amount: 200, date: '2026-01-10', createdAt: '2026-01-10T00:00:00.000Z' },
    { id: 'e-3', periodId: 'p-jan', categoryId: 'cat-1', description: 'Ropa',    amount: 50,  date: '2026-01-10', createdAt: '2026-01-10T00:00:00.000Z' },
  ]

  it('returns one entry per day of the month', () => {
    const result = buildDailyCumulativeData(expenses, period)
    expect(result).toHaveLength(31) // January has 31 days
    expect(result[0].day).toBe(1)
    expect(result[30].day).toBe(31)
  })

  it('cumulative carries forward on days with no expense', () => {
    const result = buildDailyCumulativeData(expenses, period)
    // days 1-4 → 0
    expect(result[0].cumulative).toBe(0)
    expect(result[3].cumulative).toBe(0)
    // day 5 → 100
    expect(result[4].cumulative).toBe(100)
    // days 6-9 → still 100
    expect(result[5].cumulative).toBe(100)
    expect(result[8].cumulative).toBe(100)
    // day 10 → 100 + 200 + 50 = 350
    expect(result[9].cumulative).toBe(350)
    // day 31 → 350 (no more expenses)
    expect(result[30].cumulative).toBe(350)
  })

  it('budget line is flat at netSalary for every day', () => {
    const result = buildDailyCumulativeData(expenses, period)
    expect(result.every(entry => entry.budget === 2000)).toBe(true)
  })

  it('returns all-zero cumulative when expenses array is empty', () => {
    const result = buildDailyCumulativeData([], period)
    expect(result).toHaveLength(31)
    expect(result.every(entry => entry.cumulative === 0)).toBe(true)
  })

  it('ignores expenses from other periods', () => {
    const mixed: Expense[] = [
      ...expenses,
      { id: 'e-other', periodId: 'p-other', categoryId: 'cat-1', description: 'Otro', amount: 9999, date: '2026-01-01', createdAt: '2026-01-01T00:00:00.000Z' },
    ]
    const result = buildDailyCumulativeData(mixed, period)
    // day 31 should be 350, not 350 + 9999
    expect(result[30].cumulative).toBe(350)
  })
})
