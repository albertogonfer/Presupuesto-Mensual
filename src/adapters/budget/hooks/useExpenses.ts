import { useExpensesStore } from '../store/expensesStore'
import { usePeriodsStore } from '../store/periodsStore'

export function useExpenses() {
  const activePeriodId = usePeriodsStore((s) => s.activePeriodId)
  const allExpenses = useExpensesStore((s) => s.expenses)
  const addExpense = useExpensesStore((s) => s.addExpense)
  const updateExpense = useExpensesStore((s) => s.updateExpense)
  const removeExpense = useExpensesStore((s) => s.removeExpense)

  const expenses = activePeriodId
    ? allExpenses.filter((e) => e.periodId === activePeriodId)
    : []

  return { expenses, addExpense, updateExpense, removeExpense }
}
