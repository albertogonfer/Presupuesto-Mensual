import { create } from 'zustand'
import type { RecurringExpense } from '../../../domain/budget/model/types'
import { recurringExpensesRepository } from '../../../infrastructure/storage/recurringExpensesRepository'

type RecurringExpensesState = {
  recurringExpenses: RecurringExpense[]
  loading: boolean
  error: string | null
  fetchAll: () => Promise<void>
  addRecurringExpense: (
    data: Omit<RecurringExpense, 'id' | 'createdAt' | 'occurrenceCount' | 'active'>,
  ) => Promise<RecurringExpense>
  updateRecurringExpense: (
    id: string,
    partial: Partial<Omit<RecurringExpense, 'id' | 'createdAt'>>,
  ) => Promise<void>
  cancelRecurringExpense: (id: string) => Promise<void>
  incrementOccurrence: (id: string) => Promise<void>
  getActiveRecurring: () => RecurringExpense[]
  reset: () => void
}

export const useRecurringExpensesStore = create<RecurringExpensesState>()((set, get) => ({
  recurringExpenses: [],
  loading: false,
  error: null,

  async fetchAll() {
    set({ loading: true, error: null })
    try {
      const recurringExpenses = await recurringExpensesRepository.getAll()
      set({ recurringExpenses, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  async addRecurringExpense(data) {
    const newRecurring: RecurringExpense = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      occurrenceCount: 0,
      active: true,
    }
    set((s) => ({ recurringExpenses: [...s.recurringExpenses, newRecurring] }))
    try {
      await recurringExpensesRepository.create(newRecurring)
    } catch (e) {
      set((s) => ({
        recurringExpenses: s.recurringExpenses.filter((r) => r.id !== newRecurring.id),
        error: (e as Error).message,
      }))
    }
    return newRecurring
  },

  async updateRecurringExpense(id, partial) {
    set((s) => ({
      recurringExpenses: s.recurringExpenses.map((r) =>
        r.id === id ? { ...r, ...partial } : r,
      ),
    }))
    try {
      await recurringExpensesRepository.update(id, partial)
    } catch (e) {
      set({ error: (e as Error).message })
      await get().fetchAll()
    }
  },

  async cancelRecurringExpense(id) {
    set((s) => ({
      recurringExpenses: s.recurringExpenses.map((r) =>
        r.id === id ? { ...r, active: false } : r,
      ),
    }))
    try {
      await recurringExpensesRepository.update(id, { active: false })
    } catch (e) {
      set({ error: (e as Error).message })
      await get().fetchAll()
    }
  },

  async incrementOccurrence(id) {
    const current = get().recurringExpenses.find((r) => r.id === id)
    if (!current) return
    const newCount = current.occurrenceCount + 1
    set((s) => ({
      recurringExpenses: s.recurringExpenses.map((r) =>
        r.id === id ? { ...r, occurrenceCount: newCount } : r,
      ),
    }))
    try {
      await recurringExpensesRepository.update(id, { occurrenceCount: newCount })
    } catch (e) {
      set({ error: (e as Error).message })
      await get().fetchAll()
    }
  },

  getActiveRecurring() {
    return get().recurringExpenses.filter((r) => r.active)
  },

  reset() {
    set({ recurringExpenses: [], loading: false, error: null })
  },
}))
