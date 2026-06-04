import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Expense } from '../../../domain/budget/model/types'

type ExpensesState = {
  expenses: Expense[]
  hasHydrated: boolean
  addExpense: (payload: Omit<Expense, 'id' | 'createdAt'>) => void
  updateExpense: (id: string, patch: Partial<Omit<Expense, 'id' | 'createdAt'>>) => void
  removeExpense: (id: string) => void
  removeExpensesByPeriod: (periodId: string) => void
  getByPeriod: (periodId: string) => Expense[]
}

export const useExpensesStore = create<ExpensesState>()(
  persist(
    (set, get) => ({
      expenses: [],
      hasHydrated: false,

      addExpense(payload) {
        const newExpense: Expense = {
          ...payload,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ expenses: [...s.expenses, newExpense] }))
      },

      updateExpense(id, patch) {
        set((s) => ({
          expenses: s.expenses.map((e) =>
            e.id === id ? { ...e, ...patch } : e,
          ),
        }))
      },

      removeExpense(id) {
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }))
      },

      removeExpensesByPeriod(periodId) {
        set((s) => ({ expenses: s.expenses.filter((e) => e.periodId !== periodId) }))
      },

      getByPeriod(periodId) {
        return get().expenses.filter((e) => e.periodId === periodId)
      },
    }),
    {
      name: 'budget-expenses',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true
        }
      },
    },
  ),
)
