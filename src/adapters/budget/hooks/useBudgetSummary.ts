import { useMemo } from 'react'
import { usePeriodsStore } from '../store/periodsStore'
import { useExpensesStore } from '../store/expensesStore'
import { useCategoriesStore } from '../store/categoriesStore'
import { calculateSummary } from '../../../domain/budget/services/calculateSummary'
import type { BudgetSummary } from '../../../domain/budget/model/types'

export function useBudgetSummary(): BudgetSummary | null {
  const periods = usePeriodsStore((s) => s.periods)
  const activePeriodId = usePeriodsStore((s) => s.activePeriodId)
  const allExpenses = useExpensesStore((s) => s.expenses)
  const categories = useCategoriesStore((s) => s.categories)

  return useMemo(() => {
    const period = periods.find((p) => p.id === activePeriodId)
    if (!period) return null
    const expenses = allExpenses.filter((e) => e.periodId === activePeriodId)
    return calculateSummary(period, expenses, categories)
  }, [periods, activePeriodId, allExpenses, categories])
}
