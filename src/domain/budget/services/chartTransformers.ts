import type { BudgetSummary, BudgetPeriod, Expense } from '../model/types'

export type PieChartData = {
  name: string
  value: number
  fill: string
}

export type BarChartData = {
  month: string
  gastado: number
  presupuesto: number
}

export type DailyCumulativeDataPoint = {
  day: number
  cumulative: number
  budget: number
}

/**
 * Maps BudgetSummary.byCategory to Recharts PieChart data.
 * Returns [] when there are no categories with expenses.
 */
export function buildPieData(summary: BudgetSummary): PieChartData[] {
  return summary.byCategory.map(({ category, total }) => ({
    name: category.name,
    value: total,
    fill: category.color,
  }))
}

/**
 * Builds monthly bar chart data sorted chronologically.
 * @param periods  - All budget periods to include
 * @param expenses - All expenses (filtered per period internally)
 */
export function buildBarData(
  periods: BudgetPeriod[],
  expenses: Expense[],
): BarChartData[] {
  const sorted = [...periods].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.month - b.month
  })

  return sorted.map((period) => {
    const periodExpenses = expenses.filter((e) => e.periodId === period.id)
    const gastado = periodExpenses.reduce((sum, e) => sum + e.amount, 0)

    const date = new Date(period.year, period.month - 1, 1)
    const month = new Intl.DateTimeFormat('es-ES', {
      month: 'short',
      year: 'numeric',
    }).format(date)

    return {
      month,
      gastado,
      presupuesto: period.netSalary,
    }
  })
}

/**
 * Builds daily cumulative spending data for a given period.
 * Returns one entry per day of the period's month (1..N).
 * @param expenses - All expenses (filtered by periodId internally)
 * @param period   - The budget period to build data for
 */
export function buildDailyCumulativeData(
  expenses: Expense[],
  period: BudgetPeriod,
): DailyCumulativeDataPoint[] {
  const daysInMonth = new Date(period.year, period.month, 0).getDate()
  const periodExpenses = expenses.filter((e) => e.periodId === period.id)

  const result: DailyCumulativeDataPoint[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${period.year}-${String(period.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayTotal = periodExpenses
      .filter((e) => e.date <= dateStr)
      .reduce((sum, e) => sum + e.amount, 0)

    // dayTotal is the total up to this day — use it directly instead of accumulating
    result.push({ day, cumulative: dayTotal, budget: period.netSalary })
  }

  return result
}
