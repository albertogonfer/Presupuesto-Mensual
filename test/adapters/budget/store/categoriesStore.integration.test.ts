import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useCategoriesStore } from '@/adapters/budget/store/categoriesStore'

beforeEach(() => {
  useCategoriesStore.setState({ categories: [], hasHydrated: true })
})

describe('categoriesStore — delete referenced category block (integration)', () => {
  it('blocks deletion and returns error when expenseIds reference the category', () => {
    act(() => {
      useCategoriesStore.getState().addCategory({ name: 'Comida', color: '#10B981', icon: '🛒' })
    })
    const categoryId = useCategoriesStore.getState().categories[0].id
    // Simulate external expenses referencing this category
    const expenseCategoryIds = [categoryId, 'other-cat-id']
    let result: { success: boolean; error?: string } = { success: true }
    act(() => {
      result = useCategoriesStore.getState().removeCategory(categoryId, expenseCategoryIds)
    })
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
    // Category must still exist
    expect(useCategoriesStore.getState().categories).toHaveLength(1)
  })

  it('allows deletion when a different category is referenced but not this one', () => {
    act(() => {
      useCategoriesStore.getState().addCategory({ name: 'Free', color: '#000', icon: '✅' })
    })
    const categoryId = useCategoriesStore.getState().categories[0].id
    const expenseCategoryIds = ['other-cat-id'] // doesn't include categoryId
    let result: { success: boolean; error?: string } = { success: false }
    act(() => {
      result = useCategoriesStore.getState().removeCategory(categoryId, expenseCategoryIds)
    })
    expect(result.success).toBe(true)
    expect(useCategoriesStore.getState().categories).toHaveLength(0)
  })

  it('shows a Spanish error message when deletion is blocked', () => {
    act(() => {
      useCategoriesStore.getState().addCategory({ name: 'Gastos', color: '#000', icon: '💸' })
    })
    const categoryId = useCategoriesStore.getState().categories[0].id
    let result: { success: boolean; error?: string } = { success: true }
    act(() => {
      result = useCategoriesStore.getState().removeCategory(categoryId, [categoryId])
    })
    expect(result.error).toMatch(/gasto|categoría|referenciada/i)
  })
})
