import { useExpensesStore } from '../store/expensesStore'
import { usePeriodsStore } from '../store/periodsStore'

export function useExpenses() {
  const activePeriodId = usePeriodsStore((s) => s.activePeriodId)
  const allExpenses = useExpensesStore((s) => s.expenses)
  const loading = useExpensesStore((s) => s.loading)
  const error = useExpensesStore((s) => s.error)
  const fetchAll = useExpensesStore((s) => s.fetchAll)
  const addExpense = useExpensesStore((s) => s.addExpense)
  const updateExpense = useExpensesStore((s) => s.updateExpense)
  const removeExpense = useExpensesStore((s) => s.removeExpense)

  const expenses = activePeriodId
    ? allExpenses.filter((e) => e.periodId === activePeriodId)
    : []

  return { expenses, loading, error, fetchAll, addExpense, updateExpense, removeExpense }
}
