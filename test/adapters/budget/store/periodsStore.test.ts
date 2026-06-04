import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePeriodsStore } from '@/adapters/budget/store/periodsStore'
import type { BudgetPeriod } from '@/domain/budget/model/types'

vi.mock('@/infrastructure/storage/periodsRepository', () => ({
  periodsRepository: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async (p: BudgetPeriod) => p),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}))

// Mock dependent stores so createPeriod doesn't trigger real repo calls
vi.mock('@/adapters/budget/store/recurringExpensesStore', () => ({
  useRecurringExpensesStore: {
    getState: vi.fn().mockReturnValue({
      getActiveRecurring: vi.fn().mockReturnValue([]),
      incrementOccurrence: vi.fn().mockResolvedValue(undefined),
    }),
  },
}))

vi.mock('@/adapters/budget/store/expensesStore', () => ({
  useExpensesStore: {
    getState: vi.fn().mockReturnValue({
      addExpense: vi.fn().mockResolvedValue(undefined),
      removeExpensesByPeriod: vi.fn().mockResolvedValue(undefined),
    }),
  },
}))

function getStore() {
  return usePeriodsStore.getState()
}

beforeEach(() => {
  usePeriodsStore.setState({ periods: [], activePeriodId: null, loading: false, error: null, hasHydrated: true })
})

describe('periodsStore — createPeriod', () => {
  it('creates a new period with the given month, year, and netSalary', async () => {
    const result = await getStore().createPeriod({ month: 6, year: 2026, netSalary: 350000 })
    const { periods } = getStore()
    expect(result.success).toBe(true)
    expect(periods).toHaveLength(1)
    expect(periods[0].month).toBe(6)
    expect(periods[0].year).toBe(2026)
    expect(periods[0].netSalary).toBe(350000)
  })

  it('generates a unique id and createdAt on creation', async () => {
    await getStore().createPeriod({ month: 1, year: 2026, netSalary: 100000 })
    const { periods } = getStore()
    expect(periods[0].id).toBeTruthy()
    expect(periods[0].createdAt).toBeTruthy()
  })

  it('rejects a duplicate (month, year) pair with an error', async () => {
    await getStore().createPeriod({ month: 6, year: 2026, netSalary: 350000 })
    const result = await getStore().createPeriod({ month: 6, year: 2026, netSalary: 400000 })
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/ya existe/i)
    expect(getStore().periods).toHaveLength(1)
  })

  it('allows same month in different years', async () => {
    await getStore().createPeriod({ month: 6, year: 2025, netSalary: 300000 })
    await getStore().createPeriod({ month: 6, year: 2026, netSalary: 350000 })
    expect(getStore().periods).toHaveLength(2)
  })

  it('sets the created period as active', async () => {
    await getStore().createPeriod({ month: 6, year: 2026, netSalary: 350000 })
    const { periods, activePeriodId } = getStore()
    expect(activePeriodId).toBe(periods[0].id)
  })
})

describe('periodsStore — updatePeriod', () => {
  it('updates netSalary of an existing period', async () => {
    await getStore().createPeriod({ month: 6, year: 2026, netSalary: 350000 })
    const id = getStore().periods[0].id
    await getStore().updatePeriod(id, { netSalary: 400000 })
    const updated = getStore().periods.find((p) => p.id === id)
    expect(updated?.netSalary).toBe(400000)
  })

  it('does not modify other periods when updating one', async () => {
    await getStore().createPeriod({ month: 5, year: 2026, netSalary: 300000 })
    await getStore().createPeriod({ month: 6, year: 2026, netSalary: 350000 })
    const idFirst = getStore().periods[0].id
    await getStore().updatePeriod(idFirst, { netSalary: 999999 })
    expect(getStore().periods[1].netSalary).toBe(350000)
  })
})

describe('periodsStore — setActivePeriod', () => {
  it('sets the activePeriodId to the given id', async () => {
    await getStore().createPeriod({ month: 5, year: 2026, netSalary: 300000 })
    await getStore().createPeriod({ month: 6, year: 2026, netSalary: 350000 })
    const firstId = getStore().periods[0].id
    getStore().setActivePeriod(firstId)
    expect(getStore().activePeriodId).toBe(firstId)
  })

  it('allows navigating back to a past period', async () => {
    await getStore().createPeriod({ month: 1, year: 2026, netSalary: 300000 })
    await getStore().createPeriod({ month: 2, year: 2026, netSalary: 310000 })
    await getStore().createPeriod({ month: 3, year: 2026, netSalary: 320000 })
    const periods = getStore().periods
    getStore().setActivePeriod(periods[0].id)
    expect(getStore().activePeriodId).toBe(periods[0].id)
    getStore().setActivePeriod(periods[2].id)
    expect(getStore().activePeriodId).toBe(periods[2].id)
  })

  it('returns sorted periods newest first (derived)', async () => {
    await getStore().createPeriod({ month: 3, year: 2026, netSalary: 320000 })
    await getStore().createPeriod({ month: 1, year: 2026, netSalary: 300000 })
    await getStore().createPeriod({ month: 2, year: 2026, netSalary: 310000 })
    const { periods } = getStore()
    const sorted = [...periods].sort((a, b) =>
      b.year !== a.year ? b.year - a.year : b.month - a.month,
    )
    expect(sorted[0].month).toBe(3)
    expect(sorted[2].month).toBe(1)
  })
})
