import type { BudgetPeriod, Expense, Category, BudgetSummary, RecurringExpense } from '../model/types'
import { getMonthlyBalloonReserve } from './recurringExpenseService'

export function calculateSummary(
  period: BudgetPeriod,
  expenses: Expense[],
  categories: Category[],
  activeRecurring: RecurringExpense[] = [],
  currentMonth: number = period.month,
  currentYear: number = period.year,
): BudgetSummary {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const remaining = period.netSalary - totalSpent
  const percentUsed = period.netSalary > 0 ? (totalSpent / period.netSalary) * 100 : 0

  // Group expenses by category
  const totalsById = new Map<string, number>()
  for (const expense of expenses) {
    totalsById.set(expense.categoryId, (totalsById.get(expense.categoryId) ?? 0) + expense.amount)
  }

  const byCategory = categories
    .filter((cat) => totalsById.has(cat.id))
    .map((cat) => ({
      category: cat,
      total: totalsById.get(cat.id)!,
      percentage: totalSpent > 0 ? (totalsById.get(cat.id)! / totalSpent) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)

  const savingsGoal = period.savingsGoal
  const savingsProgress = savingsGoal !== undefined ? remaining - savingsGoal : undefined

  // Mandatory reserves (balloon payments)
  const mandatoryReserves: BudgetSummary['mandatoryReserves'] = []
  for (const r of activeRecurring) {
    const reserve = getMonthlyBalloonReserve(r, currentMonth, currentYear)
    if (reserve > 0) {
      mandatoryReserves.push({
        recurringId: r.id,
        description: r.description,
        monthlyReserve: reserve,
      })
    }
  }
  const totalMandatoryReserves = mandatoryReserves.reduce((sum, mr) => sum + mr.monthlyReserve, 0)
  const adjustedRemaining = remaining - totalMandatoryReserves

  return { totalSpent, remaining, percentUsed, byCategory, savingsGoal, savingsProgress, mandatoryReserves, totalMandatoryReserves, adjustedRemaining }
}
