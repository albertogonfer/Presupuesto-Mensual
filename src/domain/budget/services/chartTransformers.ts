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
