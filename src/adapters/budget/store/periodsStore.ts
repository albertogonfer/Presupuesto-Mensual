import { create } from 'zustand'
import type { BudgetPeriod } from '../../../domain/budget/model/types'
import { buildExpensesForPeriod } from '../../../domain/budget/services/recurringExpenseService'
import { periodsRepository } from '../../../infrastructure/storage/periodsRepository'
import { useRecurringExpensesStore } from './recurringExpensesStore'
import { useExpensesStore } from './expensesStore'

type CreatePeriodResult = { success: boolean; error?: string }

type PeriodsState = {
  periods: BudgetPeriod[]
  activePeriodId: string | null
  loading: boolean
  error: string | null
  fetchAll: () => Promise<void>
  createPeriod: (payload: Omit<BudgetPeriod, 'id' | 'createdAt'>) => Promise<CreatePeriodResult>
  updatePeriod: (id: string, patch: Partial<Omit<BudgetPeriod, 'id' | 'createdAt'>>) => Promise<void>
  deletePeriod: (id: string) => Promise<void>
  setActivePeriod: (id: string) => void
  reset: () => void
}

export const usePeriodsStore = create<PeriodsState>()((set, get) => ({
  periods: [],
  activePeriodId: null,
  loading: true,
  error: null,

  async fetchAll() {
    set({ loading: true, error: null })
    try {
      const periods = await periodsRepository.getAll()
      set({ periods, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  async createPeriod(payload) {
    const { periods } = get()
    const duplicate = periods.find(
      (p) => p.month === payload.month && p.year === payload.year,
    )
    if (duplicate) {
      return {
        success: false,
        error: `Ya existe un período para ${payload.month}/${payload.year}. Edita el existente si quieres cambiar el sueldo.`,
      }
    }

    const newPeriod: BudgetPeriod = {
      ...payload,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }

    // 1. Persist period to DB first — abort if it fails
    try {
      await periodsRepository.create(newPeriod)
    } catch (e) {
      return { success: false, error: (e as Error).message }
    }

    // 2. Update local state after successful DB insert
    set((s) => ({
      periods: [...s.periods, newPeriod],
      activePeriodId: newPeriod.id,
    }))

    // 3. Generate recurring expenses sequentially (partial failure is acceptable)
    const recurringState = useRecurringExpensesStore.getState()
    const activeRecurring = recurringState.getActiveRecurring()
    const expensesToCreate = buildExpensesForPeriod(newPeriod, activeRecurring)

    for (const expense of expensesToCreate) {
      await useExpensesStore.getState().addExpense(expense)
    }

    // 4. Increment occurrence counts for generated recurrings
    for (const recurring of activeRecurring) {
      if (expensesToCreate.some((e) => e.description === `🔁 ${recurring.description}`)) {
        await recurringState.incrementOccurrence(recurring.id)
      }
    }

    return { success: true }
  },

  async updatePeriod(id, patch) {
    set((s) => ({
      periods: s.periods.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
    try {
      await periodsRepository.update(id, patch)
    } catch (e) {
      set({ error: (e as Error).message })
      await get().fetchAll()
    }
  },

  async deletePeriod(id) {
    const { periods, activePeriodId } = get()
    const remaining = periods.filter((p) => p.id !== id)
    const newActive =
      activePeriodId === id ? (remaining.at(-1)?.id ?? null) : activePeriodId

    set({ periods: remaining, activePeriodId: newActive })
    await useExpensesStore.getState().removeExpensesByPeriod(id)

    try {
      await periodsRepository.delete(id)
    } catch (e) {
      set({ error: (e as Error).message })
      await get().fetchAll()
    }
  },

  setActivePeriod(id) {
    set({ activePeriodId: id })
  },

  reset() {
    set({ periods: [], activePeriodId: null, loading: true, error: null })
  },
}))
