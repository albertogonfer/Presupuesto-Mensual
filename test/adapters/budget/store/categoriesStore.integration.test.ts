import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCategoriesStore } from '@/adapters/budget/store/categoriesStore'
import type { Category } from '@/domain/budget/model/types'

vi.mock('@/infrastructure/storage/categoriesRepository', () => ({
  categoriesRepository: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async (cat: Omit<Category, 'createdAt'>) => ({
      ...cat,
      createdAt: new Date().toISOString(),
    })),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}))

function getStore() {
  return useCategoriesStore.getState()
}

beforeEach(() => {
  useCategoriesStore.setState({ categories: [], loading: false, error: null, hasHydrated: true })
})

describe('categoriesStore — delete referenced category block (integration)', () => {
  it('blocks deletion and returns error when expenseIds reference the category', async () => {
    await getStore().addCategory({ name: 'Comida', color: '#10B981', icon: '🛒' })
    const categoryId = getStore().categories[0].id
    const expenseCategoryIds = [categoryId, 'other-cat-id']

    const result = await getStore().removeCategory(categoryId, expenseCategoryIds)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
    // Category must still exist
    expect(getStore().categories).toHaveLength(1)
  })

  it('allows deletion when a different category is referenced but not this one', async () => {
    await getStore().addCategory({ name: 'Free', color: '#000', icon: '✅' })
    const categoryId = getStore().categories[0].id
    const expenseCategoryIds = ['other-cat-id'] // doesn't include categoryId

    const result = await getStore().removeCategory(categoryId, expenseCategoryIds)

    expect(result.success).toBe(true)
    expect(getStore().categories).toHaveLength(0)
  })

  it('shows a Spanish error message when deletion is blocked', async () => {
    await getStore().addCategory({ name: 'Gastos', color: '#000', icon: '💸' })
    const categoryId = getStore().categories[0].id

    const result = await getStore().removeCategory(categoryId, [categoryId])

    expect(result.error).toMatch(/gasto|categoría|referenciada/i)
  })
})
