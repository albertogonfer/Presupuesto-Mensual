import { useMemo } from 'react'
import { usePeriodsStore } from '../store/periodsStore'
import { useExpensesStore } from '../store/expensesStore'
import { useCategoriesStore } from '../store/categoriesStore'
import { useRecurringExpensesStore } from '../store/recurringExpensesStore'
import { calculateSummary } from '../../../domain/budget/services/calculateSummary'
import type { BudgetSummary } from '../../../domain/budget/model/types'

export function useBudgetSummary(): BudgetSummary | null {
  const periods = usePeriodsStore((s) => s.periods)
  const activePeriodId = usePeriodsStore((s) => s.activePeriodId)
  const allExpenses = useExpensesStore((s) => s.expenses)
  const categories = useCategoriesStore((s) => s.categories)
  const recurringExpenses = useRecurringExpensesStore((s) => s.recurringExpenses)

  return useMemo(() => {
    const period = periods.find((p) => p.id === activePeriodId)
    if (!period) return null
    const expenses = allExpenses.filter((e) => e.periodId === activePeriodId)
    const activeRecurring = recurringExpenses.filter((r) => r.active)
    return calculateSummary(period, expenses, categories, activeRecurring, period.month, period.year)
  }, [periods, activePeriodId, allExpenses, categories, recurringExpenses])
}
