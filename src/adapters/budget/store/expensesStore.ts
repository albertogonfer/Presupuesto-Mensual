import { create } from 'zustand'
import type { Expense } from '../../../domain/budget/model/types'
import { expensesRepository } from '../../../infrastructure/storage/expensesRepository'

type ExpensesState = {
  expenses: Expense[]
  loading: boolean
  error: string | null
  fetchAll: () => Promise<void>
  addExpense: (payload: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>
  updateExpense: (id: string, patch: Partial<Omit<Expense, 'id' | 'createdAt'>>) => Promise<void>
  removeExpense: (id: string) => Promise<void>
  removeExpensesByPeriod: (periodId: string) => Promise<void>
  getByPeriod: (periodId: string) => Expense[]
  reset: () => void
}

export const useExpensesStore = create<ExpensesState>()((set, get) => ({
  expenses: [],
  loading: false,
  error: null,

  async fetchAll() {
    set({ loading: true, error: null })
    try {
      const expenses = await expensesRepository.getAll()
      set({ expenses, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  async addExpense(payload) {
    const newExpense: Expense = {
      ...payload,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    set((s) => ({ expenses: [...s.expenses, newExpense] }))
    try {
      await expensesRepository.create(newExpense)
    } catch (e) {
      set((s) => ({
        expenses: s.expenses.filter((ex) => ex.id !== newExpense.id),
        error: (e as Error).message,
      }))
    }
  },

  async updateExpense(id, patch) {
    set((s) => ({
      expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }))
    try {
      await expensesRepository.update(id, patch)
    } catch (e) {
      set({ error: (e as Error).message })
      await get().fetchAll()
    }
  },

  async removeExpense(id) {
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }))
    try {
      await expensesRepository.delete(id)
    } catch (e) {
      set({ error: (e as Error).message })
      await get().fetchAll()
    }
  },

  async removeExpensesByPeriod(periodId) {
    set((s) => ({ expenses: s.expenses.filter((e) => e.periodId !== periodId) }))
    try {
      await expensesRepository.deleteByPeriod(periodId)
    } catch (e) {
      set({ error: (e as Error).message })
      await get().fetchAll()
    }
  },

  getByPeriod(periodId) {
    return get().expenses.filter((e) => e.periodId === periodId)
  },

  reset() {
    set({ expenses: [], loading: true, error: null })
  },
}))
