import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BudgetPeriod } from '../../../domain/budget/model/types'
import { buildExpensesForPeriod } from '../../../domain/budget/services/recurringExpenseService'
import { useRecurringExpensesStore } from './recurringExpensesStore'
import { useExpensesStore } from './expensesStore'

type CreatePeriodResult = { success: boolean; error?: string }

type PeriodsState = {
  periods: BudgetPeriod[]
  activePeriodId: string | null
  hasHydrated: boolean
  createPeriod: (payload: Omit<BudgetPeriod, 'id' | 'createdAt'>) => CreatePeriodResult
  updatePeriod: (id: string, patch: Partial<Omit<BudgetPeriod, 'id' | 'createdAt'>>) => void
  setActivePeriod: (id: string) => void
}

export const usePeriodsStore = create<PeriodsState>()(
  persist(
    (set, get) => ({
      periods: [],
      activePeriodId: null,
      hasHydrated: false,

      createPeriod(payload) {
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
        set((s) => ({
          periods: [...s.periods, newPeriod],
          activePeriodId: newPeriod.id,
        }))

        // Auto-generate recurring expenses for this period
        const recurringState = useRecurringExpensesStore.getState()
        const expensesState = useExpensesStore.getState()
        const activeRecurring = recurringState.getActiveRecurring()
        const expensesToCreate = buildExpensesForPeriod(newPeriod, activeRecurring)
        for (const expense of expensesToCreate) {
          expensesState.addExpense(expense)
        }
        // Increment occurrenceCount for each recurring that generated an expense
        for (const recurring of activeRecurring) {
          if (expensesToCreate.some((e) => e.description === `🔁 ${recurring.description}`)) {
            recurringState.incrementOccurrence(recurring.id)
          }
        }

        return { success: true }
      },

      updatePeriod(id, patch) {
        set((s) => ({
          periods: s.periods.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        }))
      },

      setActivePeriod(id) {
        set({ activePeriodId: id })
      },
    }),
    {
      name: 'budget-periods',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true
        }
      },
    },
  ),
)
