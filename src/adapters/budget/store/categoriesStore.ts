import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Category } from '../../../domain/budget/model/types'

type RemoveResult = { success: boolean; error?: string }

type CategoriesState = {
  categories: Category[]
  hasHydrated: boolean
  seedIfEmpty: () => void
  addCategory: (payload: Omit<Category, 'id' | 'createdAt'>) => void
  updateCategory: (id: string, patch: Partial<Omit<Category, 'id' | 'createdAt'>>) => void
  removeCategory: (id: string, expenseCategoryIds: string[]) => RemoveResult
}

const SEED_CATEGORIES: Omit<Category, 'id' | 'createdAt'>[] = [
  { name: 'Comida',     color: '#10B981', icon: '🛒' },
  { name: 'Préstamos',  color: '#F59E0B', icon: '💳' },
  { name: 'Otros',      color: '#8B5CF6', icon: '📦' },
]

export const useCategoriesStore = create<CategoriesState>()(
  persist(
    (set, get) => ({
      categories: [],
      hasHydrated: false,

      seedIfEmpty() {
        if (get().categories.length === 0) {
          const seeded: Category[] = SEED_CATEGORIES.map((c) => ({
            ...c,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          }))
          set({ categories: seeded })
        }
      },

      addCategory(payload) {
        const newCat: Category = {
          ...payload,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ categories: [...s.categories, newCat] }))
      },

      updateCategory(id, patch) {
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        }))
      },

      removeCategory(id, expenseCategoryIds) {
        const isReferenced = expenseCategoryIds.includes(id)
        if (isReferenced) {
          return {
            success: false,
            error: 'No se puede eliminar: la categoría está referenciada por gastos existentes.',
          }
        }
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }))
        return { success: true }
      },
    }),
    {
      name: 'budget-categories',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true
          state.seedIfEmpty()
        }
      },
    },
  ),
)
