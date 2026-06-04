import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RecurringExpense } from '../../../domain/budget/model/types'

type RecurringExpensesState = {
  recurringExpenses: RecurringExpense[]
  addRecurringExpense: (data: Omit<RecurringExpense, 'id' | 'createdAt' | 'occurrenceCount' | 'active'>) => RecurringExpense
  updateRecurringExpense: (id: string, partial: Partial<Omit<RecurringExpense, 'id' | 'createdAt'>>) => void
  cancelRecurringExpense: (id: string) => void
  incrementOccurrence: (id: string) => void
  getActiveRecurring: () => RecurringExpense[]
}

export const useRecurringExpensesStore = create<RecurringExpensesState>()(
  persist(
    (set, get) => ({
      recurringExpenses: [],

      addRecurringExpense(data) {
        const newRecurring: RecurringExpense = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          occurrenceCount: 0,
          active: true,
        }
        set((s) => ({ recurringExpenses: [...s.recurringExpenses, newRecurring] }))
        return newRecurring
      },

      updateRecurringExpense(id, partial) {
        set((s) => ({
          recurringExpenses: s.recurringExpenses.map((r) =>
            r.id === id ? { ...r, ...partial } : r,
          ),
        }))
      },

      cancelRecurringExpense(id) {
        set((s) => ({
          recurringExpenses: s.recurringExpenses.map((r) =>
            r.id === id ? { ...r, active: false } : r,
          ),
        }))
      },

      incrementOccurrence(id) {
        set((s) => ({
          recurringExpenses: s.recurringExpenses.map((r) =>
            r.id === id ? { ...r, occurrenceCount: r.occurrenceCount + 1 } : r,
          ),
        }))
      },

      getActiveRecurring() {
        return get().recurringExpenses.filter((r) => r.active)
      },
    }),
    { name: 'budget-recurring-expenses' },
  ),
)
