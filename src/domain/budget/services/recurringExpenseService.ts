import type { BudgetPeriod, Expense, RecurringExpense } from '../model/types'

const MONTH_NAMES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/**
 * Returns true if the recurring expense is expired as of the given period.
 */
export function isExpiredForPeriod(
  recurring: RecurringExpense,
  periodMonth: number,
  periodYear: number,
): boolean {
  // expired by endsAfter
  if (recurring.endsAfter !== undefined && recurring.occurrenceCount >= recurring.endsAfter) {
    return true
  }

  // expired by endsAt
  if (recurring.endsAt) {
    const periodFirstDay = `${periodYear}-${String(periodMonth).padStart(2, '0')}-01`
    return recurring.endsAt < periodFirstDay
  }

  return false
}

/**
 * Returns true if this recurring expense should generate an expense for the given period.
 */
export function shouldGenerateForPeriod(
  recurring: RecurringExpense,
  periodMonth: number,
  periodYear: number,
): boolean {
  if (!recurring.active) return false
  if (isExpiredForPeriod(recurring, periodMonth, periodYear)) return false

  // For now, frequency-based logic (daily/weekly we treat as monthly-eligible)
  // monthly + every: 1 → generate every month
  // For other frequencies we still generate once per period (simplified approach)
  // unless every > 1 for monthly — e.g. every: 2 means every 2 months
  if (recurring.frequency === 'monthly') {
    // Calculate how many months since createdAt
    const createdDate = new Date(recurring.createdAt)
    const createdMonth = createdDate.getMonth() + 1
    const createdYear = createdDate.getFullYear()
    const monthsDiff =
      (periodYear - createdYear) * 12 + (periodMonth - createdMonth)
    if (monthsDiff < 0) return false
    return monthsDiff % recurring.every === 0
  }

  if (recurring.frequency === 'yearly') {
    const createdDate = new Date(recurring.createdAt)
    const createdYear = createdDate.getFullYear()
    const createdMonth = createdDate.getMonth() + 1
    const yearsDiff = periodYear - createdYear
    if (yearsDiff < 0) return false
    if (periodMonth !== createdMonth) return false
    return yearsDiff % recurring.every === 0
  }

  // daily and weekly: generate once per period (month)
  return true
}

/**
 * Returns a human-readable label about when the recurring expense expires.
 * Returns null if indefinite.
 */
export function getRemainingLabel(
  recurring: RecurringExpense,
  currentMonth: number,
  currentYear: number,
): string | null {
  if (recurring.endsAt === undefined && recurring.endsAfter === undefined) {
    return null
  }

  if (recurring.endsAfter !== undefined) {
    const remaining = recurring.endsAfter - recurring.occurrenceCount
    if (remaining <= 0) return 'Finalizado'
    if (remaining === 1) return 'Queda 1 pago'
    return `Quedan ${remaining} pagos`
  }

  if (recurring.endsAt) {
    const periodFirstDay = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`
    if (recurring.endsAt < periodFirstDay) {
      // already expired — show "Venció en mes año"
      const endsDate = new Date(recurring.endsAt + 'T00:00:00')
      const monthName = MONTH_NAMES_ES[endsDate.getMonth()]
      return `Venció en ${monthName} ${endsDate.getFullYear()}`
    }
    // future expiry — show "Vence el dd/mm/yyyy"
    const endsDate = new Date(recurring.endsAt + 'T00:00:00')
    const day = String(endsDate.getDate()).padStart(2, '0')
    const month = String(endsDate.getMonth() + 1).padStart(2, '0')
    const year = endsDate.getFullYear()
    return `Vence el ${day}/${month}/${year}`
  }

  return null
}

/**
 * Builds the list of expenses to create for a period from active recurring expenses.
 */
export function buildExpensesForPeriod(
  period: BudgetPeriod,
  activeRecurring: RecurringExpense[],
): Omit<Expense, 'id'>[] {
  const result: Omit<Expense, 'id'>[] = []
  const date = `${period.year}-${String(period.month).padStart(2, '0')}-01`
  const now = new Date().toISOString()

  for (const recurring of activeRecurring) {
    if (!shouldGenerateForPeriod(recurring, period.month, period.year)) continue
    result.push({
      periodId: period.id,
      categoryId: recurring.categoryId,
      description: `🔁 ${recurring.description}`,
      amount: recurring.amount,
      date,
      createdAt: now,
    })
  }

  return result
}
