import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCategoriesStore } from '@/adapters/budget/store/categoriesStore'
import type { Category } from '@/domain/budget/model/types'

// Mock the repository so tests don't hit Supabase
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
  vi.clearAllMocks()
  useCategoriesStore.setState({ categories: [], loading: false, error: null, hasHydrated: true })
})

describe('categoriesStore — fetchAll seeds defaults when empty', () => {
  it('seeds 3 default categories on first fetch when repo returns empty', async () => {
    const { categoriesRepository } = await import(
      '@/infrastructure/storage/categoriesRepository'
    )
    vi.mocked(categoriesRepository.getAll)
      .mockResolvedValueOnce([]) // first call → empty → triggers seed
      .mockResolvedValue([
        { id: '1', name: 'Comida',    color: '#10B981', icon: '🛒', createdAt: '' },
        { id: '2', name: 'Préstamos', color: '#F59E0B', icon: '💳', createdAt: '' },
        { id: '3', name: 'Otros',     color: '#8B5CF6', icon: '📦', createdAt: '' },
      ])

    await getStore().fetchAll()

    const { categories } = getStore()
    expect(categories).toHaveLength(3)
    expect(categories.map((c) => c.name)).toContain('Comida')
    expect(categories.map((c) => c.name)).toContain('Préstamos')
    expect(categories.map((c) => c.name)).toContain('Otros')
  })

  it('does NOT seed when repo already has categories', async () => {
    const { categoriesRepository } = await import(
      '@/infrastructure/storage/categoriesRepository'
    )
    vi.mocked(categoriesRepository.getAll).mockResolvedValueOnce([
      { id: 'existing', name: 'Existing', color: '#000', icon: '🔥', createdAt: '' },
    ])

    await getStore().fetchAll()

    expect(categoriesRepository.create).not.toHaveBeenCalled()
    expect(getStore().categories).toHaveLength(1)
  })
})

describe('categoriesStore — add', () => {
  it('adds a new category with generated id and createdAt (optimistic)', async () => {
    await getStore().addCategory({ name: 'Test', color: '#FF0000', icon: '🧪' })
    const { categories } = getStore()
    expect(categories).toHaveLength(1)
    expect(categories[0].name).toBe('Test')
    expect(categories[0].id).toBeTruthy()
    expect(categories[0].createdAt).toBeTruthy()
  })

  it('adds multiple categories independently', async () => {
    await getStore().addCategory({ name: 'A', color: '#111', icon: '🅰️' })
    await getStore().addCategory({ name: 'B', color: '#222', icon: '🅱️' })
    expect(getStore().categories).toHaveLength(2)
  })
})

describe('categoriesStore — update', () => {
  it('updates name and color of an existing category', async () => {
    await getStore().addCategory({ name: 'Old Name', color: '#000', icon: '📦' })
    const id = getStore().categories[0].id
    await getStore().updateCategory(id, { name: 'New Name', color: '#FFF' })
    const updated = getStore().categories.find((c) => c.id === id)
    expect(updated?.name).toBe('New Name')
    expect(updated?.color).toBe('#FFF')
  })

  it('does not modify other categories when updating one', async () => {
    await getStore().addCategory({ name: 'A', color: '#111', icon: '🅰️' })
    await getStore().addCategory({ name: 'B', color: '#222', icon: '🅱️' })
    const idA = getStore().categories[0].id
    await getStore().updateCategory(idA, { name: 'Updated A' })
    expect(getStore().categories[1].name).toBe('B')
  })
})

describe('categoriesStore — remove', () => {
  it('removes a category by id when no expenses reference it', async () => {
    await getStore().addCategory({ name: 'ToDelete', color: '#000', icon: '🗑️' })
    const id = getStore().categories[0].id
    await getStore().removeCategory(id, [])
    expect(getStore().categories).toHaveLength(0)
  })

  it('returns success=true when deletion succeeds', async () => {
    await getStore().addCategory({ name: 'ToDelete', color: '#000', icon: '🗑️' })
    const id = getStore().categories[0].id
    const result = await getStore().removeCategory(id, [])
    expect(result.success).toBe(true)
  })

  it('keeps all other categories intact after removal', async () => {
    await getStore().addCategory({ name: 'Keep', color: '#111', icon: '✅' })
    await getStore().addCategory({ name: 'Delete', color: '#222', icon: '🗑️' })
    const deleteId = getStore().categories[1].id
    await getStore().removeCategory(deleteId, [])
    expect(getStore().categories).toHaveLength(1)
    expect(getStore().categories[0].name).toBe('Keep')
  })
})
