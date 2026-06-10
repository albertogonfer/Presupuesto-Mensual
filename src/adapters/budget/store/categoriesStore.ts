import { create } from 'zustand'
import type { Category } from '../../../domain/budget/model/types'
import { categoriesRepository } from '../../../infrastructure/storage/categoriesRepository'

type RemoveResult = { success: boolean; error?: string }

type CategoriesState = {
  categories: Category[]
  loading: boolean
  error: string | null
  fetchAll: () => Promise<void>
  addCategory: (payload: Omit<Category, 'id' | 'createdAt'>) => Promise<{ error?: string }>
  updateCategory: (id: string, patch: Partial<Omit<Category, 'id' | 'createdAt'>>) => Promise<void>
  removeCategory: (id: string, expenseCategoryIds: string[]) => Promise<RemoveResult>
  reset: () => void
}

const SEED_CATEGORIES: Omit<Category, 'id' | 'createdAt'>[] = [
  { name: 'Comida',    color: '#F97316', icon: 'shopping-cart' },
  { name: 'Préstamos', color: '#F59E0B', icon: 'credit-card' },
  { name: 'Otros',     color: '#8B5CF6', icon: 'package' },
]

// Accounts created before the lucide icon picker have the old emoji
// defaults stored in the DB; migrate them to their icon-library names.
const LEGACY_ICON_MIGRATION: Record<string, string> = {
  '🛒': 'shopping-cart',
  '💳': 'credit-card',
  '📦': 'package',
}

async function migrateLegacyIcons(categories: Category[]): Promise<Category[]> {
  const toMigrate = categories.filter((c) => LEGACY_ICON_MIGRATION[c.icon])
  if (toMigrate.length === 0) return categories
  await Promise.all(
    toMigrate.map((c) => categoriesRepository.update(c.id, { icon: LEGACY_ICON_MIGRATION[c.icon] })),
  )
  return categories.map((c) =>
    LEGACY_ICON_MIGRATION[c.icon] ? { ...c, icon: LEGACY_ICON_MIGRATION[c.icon] } : c,
  )
}

export const useCategoriesStore = create<CategoriesState>()((set, get) => ({
  categories: [],
  loading: true,
  error: null,

  async fetchAll() {
    set({ loading: true, error: null })
    try {
      const categories = await categoriesRepository.getAll()
      if (categories.length === 0) {
        for (const seed of SEED_CATEGORIES) {
          await categoriesRepository.create({ ...seed, id: crypto.randomUUID() })
        }
        const seeded = await categoriesRepository.getAll()
        set({ categories: seeded, loading: false })
      } else {
        set({ categories: await migrateLegacyIcons(categories), loading: false })
      }
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  async addCategory(payload) {
    const duplicate = get().categories.some(
      (c) =>
        c.name.trim().toLowerCase() === payload.name.trim().toLowerCase() &&
        c.color === payload.color &&
        c.icon === payload.icon,
    )
    if (duplicate) {
      return { error: 'Ya existe una categoría con el mismo nombre, color y emoji.' }
    }

    const newCat: Omit<Category, 'createdAt'> = { ...payload, id: crypto.randomUUID() }
    const optimistic: Category = { ...newCat, createdAt: new Date().toISOString() }
    set((s) => ({ categories: [...s.categories, optimistic] }))
    try {
      await categoriesRepository.create(newCat)
      return {}
    } catch (e) {
      set((s) => ({
        categories: s.categories.filter((c) => c.id !== newCat.id),
        error: (e as Error).message,
      }))
      return { error: (e as Error).message }
    }
  },

  async updateCategory(id, patch) {
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }))
    try {
      await categoriesRepository.update(id, patch)
    } catch (e) {
      set({ error: (e as Error).message })
      await get().fetchAll()
    }
  },

  async removeCategory(id, expenseCategoryIds) {
    const isReferenced = expenseCategoryIds.includes(id)
    if (isReferenced) {
      return {
        success: false,
        error: 'No se puede eliminar: la categoría está referenciada por gastos existentes.',
      }
    }
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }))
    try {
      await categoriesRepository.delete(id)
      return { success: true }
    } catch (e) {
      set({ error: (e as Error).message })
      await get().fetchAll()
      return { success: false, error: (e as Error).message }
    }
  },

  reset() {
    set({ categories: [], loading: true, error: null })
  },
}))
