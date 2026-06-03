import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { usePeriodsStore } from './periodsStore'

function getStore() {
  return usePeriodsStore.getState()
}

beforeEach(() => {
  usePeriodsStore.setState({ periods: [], activePeriodId: null, hasHydrated: true })
})

describe('periodsStore — createPeriod', () => {
  it('creates a new period with the given month, year, and netSalary', () => {
    let result: { success: boolean; error?: string } = { success: false }
    act(() => {
      result = getStore().createPeriod({ month: 6, year: 2026, netSalary: 350000 })
    })
    const { periods } = getStore()
    expect(result.success).toBe(true)
    expect(periods).toHaveLength(1)
    expect(periods[0].month).toBe(6)
    expect(periods[0].year).toBe(2026)
    expect(periods[0].netSalary).toBe(350000)
  })

  it('generates a unique id and createdAt on creation', () => {
    act(() => {
      getStore().createPeriod({ month: 1, year: 2026, netSalary: 100000 })
    })
    const { periods } = getStore()
    expect(periods[0].id).toBeTruthy()
    expect(periods[0].createdAt).toBeTruthy()
  })

  it('rejects a duplicate (month, year) pair with an error', () => {
    act(() => {
      getStore().createPeriod({ month: 6, year: 2026, netSalary: 350000 })
    })
    let result: { success: boolean; error?: string } = { success: true }
    act(() => {
      result = getStore().createPeriod({ month: 6, year: 2026, netSalary: 400000 })
    })
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/ya existe/i)
    expect(getStore().periods).toHaveLength(1)
  })

  it('allows same month in different years', () => {
    act(() => {
      getStore().createPeriod({ month: 6, year: 2025, netSalary: 300000 })
      getStore().createPeriod({ month: 6, year: 2026, netSalary: 350000 })
    })
    expect(getStore().periods).toHaveLength(2)
  })

  it('sets the created period as active', () => {
    act(() => {
      getStore().createPeriod({ month: 6, year: 2026, netSalary: 350000 })
    })
    const { periods, activePeriodId } = getStore()
    expect(activePeriodId).toBe(periods[0].id)
  })
})

describe('periodsStore — updatePeriod', () => {
  it('updates netSalary of an existing period', () => {
    act(() => {
      getStore().createPeriod({ month: 6, year: 2026, netSalary: 350000 })
    })
    const id = getStore().periods[0].id
    act(() => {
      getStore().updatePeriod(id, { netSalary: 400000 })
    })
    const updated = getStore().periods.find((p) => p.id === id)
    expect(updated?.netSalary).toBe(400000)
  })

  it('does not modify other periods when updating one', () => {
    act(() => {
      getStore().createPeriod({ month: 5, year: 2026, netSalary: 300000 })
      getStore().createPeriod({ month: 6, year: 2026, netSalary: 350000 })
    })
    const idFirst = getStore().periods[0].id
    act(() => {
      getStore().updatePeriod(idFirst, { netSalary: 999999 })
    })
    expect(getStore().periods[1].netSalary).toBe(350000)
  })
})

describe('periodsStore — setActivePeriod', () => {
  it('sets the activePeriodId to the given id', () => {
    act(() => {
      getStore().createPeriod({ month: 5, year: 2026, netSalary: 300000 })
      getStore().createPeriod({ month: 6, year: 2026, netSalary: 350000 })
    })
    const firstId = getStore().periods[0].id
    act(() => {
      getStore().setActivePeriod(firstId)
    })
    expect(getStore().activePeriodId).toBe(firstId)
  })
})
