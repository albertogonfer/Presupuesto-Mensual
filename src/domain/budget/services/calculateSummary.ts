import type { BudgetPeriod, Expense, Category, BudgetSummary } from '../model/types'

export function calculateSummary(
  period: BudgetPeriod,
  expenses: Expense[],
  categories: Category[],
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

  return { totalSpent, remaining, percentUsed, byCategory, savingsGoal, savingsProgress }
}
