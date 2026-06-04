import type { BudgetPeriod, Expense } from '../model/types'

export interface PeriodComparisonRow {
  periodId: string
  label: string
  netSalary: number
  totalSpent: number
  remaining: number
  percentUsed: number
  savedVsGoal?: number
  vsLastMonth?: number
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function buildComparisonData(
  periods: BudgetPeriod[],
  expenses: Expense[],
): PeriodComparisonRow[] {
  if (periods.length === 0) return []

  const sorted = [...periods].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month,
  )

  return sorted.map((period, index) => {
    const periodExpenses = expenses.filter((e) => e.periodId === period.id)
    const totalSpent = periodExpenses.reduce((sum, e) => sum + e.amount, 0)
    const remaining = period.netSalary - totalSpent
    const percentUsed = period.netSalary > 0 ? (totalSpent / period.netSalary) * 100 : 0

    const row: PeriodComparisonRow = {
      periodId: period.id,
      label: `${MONTH_NAMES[period.month - 1]} ${period.year}`,
      netSalary: period.netSalary,
      totalSpent,
      remaining,
      percentUsed,
    }

    if (period.savingsGoal !== undefined) {
      row.savedVsGoal = remaining - period.savingsGoal
    }

    if (index > 0) {
      const prev = sorted[index - 1]
      const prevExpenses = expenses.filter((e) => e.periodId === prev.id)
      const prevTotalSpent = prevExpenses.reduce((sum, e) => sum + e.amount, 0)
      row.vsLastMonth = totalSpent - prevTotalSpent
    }

    return row
  })
}
