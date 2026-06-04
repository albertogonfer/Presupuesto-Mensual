import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useExpensesStore } from '@/adapters/budget/store/expensesStore'
import type { Expense } from '@/domain/budget/model/types'

vi.mock('@/infrastructure/storage/expensesRepository', () => ({
  expensesRepository: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async (exp: Expense) => exp),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    deleteByPeriod: vi.fn().mockResolvedValue(undefined),
  },
}))

function getStore() {
  return useExpensesStore.getState()
}

const BASE_EXPENSE = {
  periodId: 'period-1',
  categoryId: 'cat-1',
  description: 'Compra supermercado',
  amount: 50,
  date: '2026-06-01',
}

beforeEach(() => {
  useExpensesStore.setState({ expenses: [], loading: false, error: null, hasHydrated: true })
})

describe('expensesStore — addExpense', () => {
  it('adds an expense with generated id and createdAt', async () => {
    await getStore().addExpense(BASE_EXPENSE)
    const { expenses } = getStore()
    expect(expenses).toHaveLength(1)
    expect(expenses[0].description).toBe('Compra supermercado')
    expect(expenses[0].id).toBeTruthy()
    expect(expenses[0].createdAt).toBeTruthy()
  })

  it('adds multiple expenses independently', async () => {
    await getStore().addExpense(BASE_EXPENSE)
    await getStore().addExpense({ ...BASE_EXPENSE, description: 'Gasolina', amount: 30 })
    expect(getStore().expenses).toHaveLength(2)
  })
})

describe('expensesStore — updateExpense', () => {
  it('updates description and amount of an existing expense', async () => {
    await getStore().addExpense(BASE_EXPENSE)
    const id = getStore().expenses[0].id
    await getStore().updateExpense(id, { description: 'Actualizado', amount: 99 })
    const updated = getStore().expenses.find((e) => e.id === id)
    expect(updated?.description).toBe('Actualizado')
    expect(updated?.amount).toBe(99)
  })

  it('does not modify other expenses when updating one', async () => {
    await getStore().addExpense(BASE_EXPENSE)
    await getStore().addExpense({ ...BASE_EXPENSE, description: 'Otro gasto' })
    const firstId = getStore().expenses[0].id
    await getStore().updateExpense(firstId, { description: 'Modificado' })
    expect(getStore().expenses[1].description).toBe('Otro gasto')
  })
})

describe('expensesStore — removeExpense', () => {
  it('removes an expense by id', async () => {
    await getStore().addExpense(BASE_EXPENSE)
    const id = getStore().expenses[0].id
    await getStore().removeExpense(id)
    expect(getStore().expenses).toHaveLength(0)
  })

  it('keeps other expenses after removing one', async () => {
    await getStore().addExpense(BASE_EXPENSE)
    await getStore().addExpense({ ...BASE_EXPENSE, description: 'Conservar' })
    const firstId = getStore().expenses[0].id
    await getStore().removeExpense(firstId)
    expect(getStore().expenses).toHaveLength(1)
    expect(getStore().expenses[0].description).toBe('Conservar')
  })
})

describe('expensesStore — getByPeriod', () => {
  it('returns only expenses for the given periodId', async () => {
    await getStore().addExpense({ ...BASE_EXPENSE, periodId: 'period-1' })
    await getStore().addExpense({ ...BASE_EXPENSE, periodId: 'period-2', description: 'Otro período' })
    const period1Expenses = getStore().getByPeriod('period-1')
    expect(period1Expenses).toHaveLength(1)
    expect(period1Expenses[0].description).toBe('Compra supermercado')
  })

  it('returns empty array when no expenses exist for periodId', async () => {
    await getStore().addExpense({ ...BASE_EXPENSE, periodId: 'period-1' })
    const result = getStore().getByPeriod('period-99')
    expect(result).toHaveLength(0)
  })

  it('returns all expenses for a period when multiple exist', async () => {
    await getStore().addExpense({ ...BASE_EXPENSE, description: 'Gasto A', periodId: 'period-1' })
    await getStore().addExpense({ ...BASE_EXPENSE, description: 'Gasto B', periodId: 'period-1' })
    await getStore().addExpense({ ...BASE_EXPENSE, description: 'Gasto C', periodId: 'period-2' })
    const result = getStore().getByPeriod('period-1')
    expect(result).toHaveLength(2)
  })
})
