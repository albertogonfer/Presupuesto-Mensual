import { useExpensesStore } from '../store/expensesStore'
import { usePeriodsStore } from '../store/periodsStore'

export function useExpenses() {
  const activePeriodId = usePeriodsStore((s) => s.activePeriodId)
  const expenses = useExpensesStore((s) =>
    activePeriodId ? s.expenses.filter((e) => e.periodId === activePeriodId) : [],
  )
  const addExpense = useExpensesStore((s) => s.addExpense)
  const updateExpense = useExpensesStore((s) => s.updateExpense)
  const removeExpense = useExpensesStore((s) => s.removeExpense)

  return { expenses, addExpense, updateExpense, removeExpense }
}
