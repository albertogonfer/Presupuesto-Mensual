import type { BudgetPeriod, Expense, Category } from '../model/types'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export interface DayBreakdown {
  date: string
  dayLabel: string
  total: number
  expenses: Expense[]
}

export interface PeriodSummaryData {
  period: BudgetPeriod
  totalSpent: number
  remaining: number
  percentUsed: number
  topSpendingDays: DayBreakdown[]
  biggestUnexpected: Expense | null
  mostExpensiveCategory: { category: Category; total: number } | null
  vsLastMonth: {
    totalSpent: number
    remaining: number
    percentUsed: number
    label: string
  } | null
  dailyBreakdown: DayBreakdown[]
}

function buildDayBreakdown(date: string, expenses: Expense[]): DayBreakdown {
  const sorted = [...expenses].sort((a, b) => b.amount - a.amount)
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const raw = new Date(date + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
  })
  const dayLabel = raw.charAt(0).toUpperCase() + raw.slice(1)
  return { date, dayLabel, total, expenses: sorted }
}

export function buildPeriodSummary(
  period: BudgetPeriod,
  expenses: Expense[],
  categories: Category[],
  allPeriods: BudgetPeriod[],
  allExpenses: Expense[],
): PeriodSummaryData {
  const periodExpenses = expenses.filter((e) => e.periodId === period.id)

  const totalSpent = periodExpenses.reduce((sum, e) => sum + e.amount, 0)
  const remaining = period.netSalary - totalSpent
  const percentUsed = period.netSalary > 0 ? (totalSpent / period.netSalary) * 100 : 0

  // Group by date
  const byDate = new Map<string, Expense[]>()
  for (const expense of periodExpenses) {
    const day = expense.date.slice(0, 10)
    if (!byDate.has(day)) byDate.set(day, [])
    byDate.get(day)!.push(expense)
  }

  const dailyBreakdown: DayBreakdown[] = [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, exps]) => buildDayBreakdown(date, exps))

  const topSpendingDays = [...dailyBreakdown]
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)

  // Biggest unexpected (non-recurring)
  const unexpected = periodExpenses.filter((e) => !e.description.startsWith('🔁 '))
  const biggestUnexpected = unexpected.length > 0
    ? unexpected.reduce((max, e) => (e.amount > max.amount ? e : max))
    : null

  // Most expensive category
  const catTotals = new Map<string, number>()
  for (const e of periodExpenses) {
    catTotals.set(e.categoryId, (catTotals.get(e.categoryId) ?? 0) + e.amount)
  }
  let mostExpensiveCategory: { category: Category; total: number } | null = null
  for (const [catId, total] of catTotals.entries()) {
    const category = categories.find((c) => c.id === catId)
    if (category && (mostExpensiveCategory === null || total > mostExpensiveCategory.total)) {
      mostExpensiveCategory = { category, total }
    }
  }

  // vsLastMonth: find the period immediately before this one
  const sorted = [...allPeriods].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month,
  )
  const currentIndex = sorted.findIndex((p) => p.id === period.id)
  let vsLastMonth: PeriodSummaryData['vsLastMonth'] = null
  if (currentIndex > 0) {
    const prev = sorted[currentIndex - 1]
    const prevExpenses = allExpenses.filter((e) => e.periodId === prev.id)
    const prevTotalSpent = prevExpenses.reduce((sum, e) => sum + e.amount, 0)
    const prevRemaining = prev.netSalary - prevTotalSpent
    const prevPercentUsed = prev.netSalary > 0 ? (prevTotalSpent / prev.netSalary) * 100 : 0
    vsLastMonth = {
      totalSpent: prevTotalSpent,
      remaining: prevRemaining,
      percentUsed: prevPercentUsed,
      label: `${MONTH_NAMES[prev.month - 1]} ${prev.year}`,
    }
  }

  return {
    period,
    totalSpent,
    remaining,
    percentUsed,
    topSpendingDays,
    biggestUnexpected,
    mostExpensiveCategory,
    vsLastMonth,
    dailyBreakdown,
  }
}
