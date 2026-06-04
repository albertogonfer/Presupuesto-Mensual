import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useCategoriesStore } from './categoriesStore'

function getStore() {
  return useCategoriesStore.getState()
}

beforeEach(() => {
  // Reset store to a clean state before each test
  useCategoriesStore.setState({ categories: [], hasHydrated: true })
})

describe('categoriesStore — seed', () => {
  it('seeds 3 default categories when categories is empty on hydration', () => {
    // Simulate first hydration with empty state
    useCategoriesStore.setState({ categories: [], hasHydrated: false })
    act(() => {
      useCategoriesStore.getState().seedIfEmpty()
    })
    const { categories } = getStore()
    expect(categories).toHaveLength(3)
  })

  it('seeds Comida, Préstamos, Otros by name', () => {
    useCategoriesStore.setState({ categories: [], hasHydrated: false })
    act(() => {
      useCategoriesStore.getState().seedIfEmpty()
    })
    const names = getStore().categories.map((c) => c.name)
    expect(names).toContain('Comida')
    expect(names).toContain('Préstamos')
    expect(names).toContain('Otros')
  })

  it('does NOT seed again when categories already exist', () => {
    useCategoriesStore.setState({
      categories: [{ id: 'existing', name: 'Existing', color: '#000', icon: '🔥', createdAt: new Date().toISOString() }],
      hasHydrated: true,
    })
    act(() => {
      useCategoriesStore.getState().seedIfEmpty()
    })
    const { categories } = getStore()
    expect(categories).toHaveLength(1)
    expect(categories[0].name).toBe('Existing')
  })
})

describe('categoriesStore — add', () => {
  it('adds a new category with generated id and createdAt', () => {
    act(() => {
      getStore().addCategory({ name: 'Test', color: '#FF0000', icon: '🧪' })
    })
    const { categories } = getStore()
    expect(categories).toHaveLength(1)
    expect(categories[0].name).toBe('Test')
    expect(categories[0].id).toBeTruthy()
    expect(categories[0].createdAt).toBeTruthy()
  })

  it('adds multiple categories independently', () => {
    act(() => {
      getStore().addCategory({ name: 'A', color: '#111', icon: '🅰️' })
      getStore().addCategory({ name: 'B', color: '#222', icon: '🅱️' })
    })
    expect(getStore().categories).toHaveLength(2)
  })
})

describe('categoriesStore — update', () => {
  it('updates name and color of an existing category', () => {
    act(() => {
      getStore().addCategory({ name: 'Old Name', color: '#000', icon: '📦' })
    })
    const id = getStore().categories[0].id
    act(() => {
      getStore().updateCategory(id, { name: 'New Name', color: '#FFF' })
    })
    const updated = getStore().categories.find((c) => c.id === id)
    expect(updated?.name).toBe('New Name')
    expect(updated?.color).toBe('#FFF')
  })

  it('does not modify other categories when updating one', () => {
    act(() => {
      getStore().addCategory({ name: 'A', color: '#111', icon: '🅰️' })
      getStore().addCategory({ name: 'B', color: '#222', icon: '🅱️' })
    })
    const idA = getStore().categories[0].id
    act(() => {
      getStore().updateCategory(idA, { name: 'Updated A' })
    })
    const catB = getStore().categories[1]
    expect(catB.name).toBe('B')
  })
})

describe('categoriesStore — remove', () => {
  it('removes a category by id when no expenses reference it', () => {
    act(() => {
      getStore().addCategory({ name: 'ToDelete', color: '#000', icon: '🗑️' })
    })
    const id = getStore().categories[0].id
    act(() => {
      getStore().removeCategory(id, [])
    })
    expect(getStore().categories).toHaveLength(0)
  })

  it('returns success=true when deletion succeeds', () => {
    act(() => {
      getStore().addCategory({ name: 'ToDelete', color: '#000', icon: '🗑️' })
    })
    const id = getStore().categories[0].id
    let result: { success: boolean; error?: string } = { success: false }
    act(() => {
      result = getStore().removeCategory(id, [])
    })
    expect(result.success).toBe(true)
  })

  it('keeps all other categories intact after removal', () => {
    act(() => {
      getStore().addCategory({ name: 'Keep', color: '#111', icon: '✅' })
      getStore().addCategory({ name: 'Delete', color: '#222', icon: '🗑️' })
    })
    const deleteId = getStore().categories[1].id
    act(() => {
      getStore().removeCategory(deleteId, [])
    })
    expect(getStore().categories).toHaveLength(1)
    expect(getStore().categories[0].name).toBe('Keep')
  })
})
