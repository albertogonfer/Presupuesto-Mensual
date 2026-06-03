import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useExpensesStore } from './expensesStore'

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
  useExpensesStore.setState({ expenses: [], hasHydrated: true })
})

describe('expensesStore — addExpense', () => {
  it('adds an expense with generated id and createdAt', () => {
    act(() => {
      getStore().addExpense(BASE_EXPENSE)
    })
    const { expenses } = getStore()
    expect(expenses).toHaveLength(1)
    expect(expenses[0].description).toBe('Compra supermercado')
    expect(expenses[0].id).toBeTruthy()
    expect(expenses[0].createdAt).toBeTruthy()
  })

  it('adds multiple expenses independently', () => {
    act(() => {
      getStore().addExpense(BASE_EXPENSE)
      getStore().addExpense({ ...BASE_EXPENSE, description: 'Gasolina', amount: 30 })
    })
    expect(getStore().expenses).toHaveLength(2)
  })
})

describe('expensesStore — updateExpense', () => {
  it('updates description and amount of an existing expense', () => {
    act(() => {
      getStore().addExpense(BASE_EXPENSE)
    })
    const id = getStore().expenses[0].id
    act(() => {
      getStore().updateExpense(id, { description: 'Actualizado', amount: 99 })
    })
    const updated = getStore().expenses.find((e) => e.id === id)
    expect(updated?.description).toBe('Actualizado')
    expect(updated?.amount).toBe(99)
  })

  it('does not modify other expenses when updating one', () => {
    act(() => {
      getStore().addExpense(BASE_EXPENSE)
      getStore().addExpense({ ...BASE_EXPENSE, description: 'Otro gasto' })
    })
    const firstId = getStore().expenses[0].id
    act(() => {
      getStore().updateExpense(firstId, { description: 'Modificado' })
    })
    const second = getStore().expenses[1]
    expect(second.description).toBe('Otro gasto')
  })
})

describe('expensesStore — removeExpense', () => {
  it('removes an expense by id', () => {
    act(() => {
      getStore().addExpense(BASE_EXPENSE)
    })
    const id = getStore().expenses[0].id
    act(() => {
      getStore().removeExpense(id)
    })
    expect(getStore().expenses).toHaveLength(0)
  })

  it('keeps other expenses after removing one', () => {
    act(() => {
      getStore().addExpense(BASE_EXPENSE)
      getStore().addExpense({ ...BASE_EXPENSE, description: 'Conservar' })
    })
    const firstId = getStore().expenses[0].id
    act(() => {
      getStore().removeExpense(firstId)
    })
    expect(getStore().expenses).toHaveLength(1)
    expect(getStore().expenses[0].description).toBe('Conservar')
  })
})

describe('expensesStore — getByPeriod', () => {
  it('returns only expenses for the given periodId', () => {
    act(() => {
      getStore().addExpense({ ...BASE_EXPENSE, periodId: 'period-1' })
      getStore().addExpense({ ...BASE_EXPENSE, periodId: 'period-2', description: 'Otro período' })
    })
    const period1Expenses = getStore().getByPeriod('period-1')
    expect(period1Expenses).toHaveLength(1)
    expect(period1Expenses[0].description).toBe('Compra supermercado')
  })

  it('returns empty array when no expenses exist for periodId', () => {
    act(() => {
      getStore().addExpense({ ...BASE_EXPENSE, periodId: 'period-1' })
    })
    const result = getStore().getByPeriod('period-99')
    expect(result).toHaveLength(0)
  })

  it('returns all expenses for a period when multiple exist', () => {
    act(() => {
      getStore().addExpense({ ...BASE_EXPENSE, description: 'Gasto A', periodId: 'period-1' })
      getStore().addExpense({ ...BASE_EXPENSE, description: 'Gasto B', periodId: 'period-1' })
      getStore().addExpense({ ...BASE_EXPENSE, description: 'Gasto C', periodId: 'period-2' })
    })
    const result = getStore().getByPeriod('period-1')
    expect(result).toHaveLength(2)
  })
})
