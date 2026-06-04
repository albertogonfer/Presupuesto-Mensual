import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('@/adapters/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}))
vi.mock('@/adapters/budget/store/categoriesStore', () => ({
  useCategoriesStore: vi.fn((sel: any) => sel({
    categories: [], loading: false, error: null,
    fetchAll: vi.fn(), reset: vi.fn(),
  })),
}))
vi.mock('@/adapters/budget/store/periodsStore', () => ({
  usePeriodsStore: vi.fn((sel: any) => sel({
    periods: [], activePeriodId: null, loading: false, error: null,
    fetchAll: vi.fn(), reset: vi.fn(), setActivePeriod: vi.fn(),
  })),
}))
vi.mock('@/adapters/budget/store/expensesStore', () => ({
  useExpensesStore: vi.fn((sel: any) => sel({
    expenses: [], loading: false, error: null,
    fetchAll: vi.fn(), reset: vi.fn(),
  })),
}))
vi.mock('@/adapters/budget/store/recurringExpensesStore', () => ({
  useRecurringExpensesStore: vi.fn((sel: any) => sel({
    recurringExpenses: [], loading: false, error: null,
    fetchAll: vi.fn(), reset: vi.fn(),
  })),
}))

import { useAuth } from '@/adapters/auth/AuthContext'
import { Layout } from '@/adapters/budget/components/Layout'
import {
  useCategoriesStore,
} from '@/adapters/budget/store/categoriesStore'
import {
  usePeriodsStore,
} from '@/adapters/budget/store/periodsStore'
import {
  useExpensesStore,
} from '@/adapters/budget/store/expensesStore'
import {
  useRecurringExpensesStore,
} from '@/adapters/budget/store/recurringExpensesStore'

describe('Layout — logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls signOut and reset on all stores when logout is clicked', async () => {
    const signOut = vi.fn().mockResolvedValue(undefined)
    const resetCat = vi.fn()
    const resetPer = vi.fn()
    const resetExp = vi.fn()
    const resetRec = vi.fn()

    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'u1', email: 'test@test.com' } as any,
      session: { user: { id: 'u1' } } as any,
      loading: false,
      signIn: vi.fn(), signUp: vi.fn(), signOut,
    })

    vi.mocked(useCategoriesStore).mockImplementation((sel: any) => sel({
      categories: [{ id: 'c1', name: 'Comida', color: '#F97316', icon: '🛒', createdAt: '' }],
      loading: false, error: null, fetchAll: vi.fn(), reset: resetCat,
    }))
    vi.mocked(usePeriodsStore).mockImplementation((sel: any) => sel({
      periods: [{ id: 'p1', month: 1, year: 2026, netSalary: 1000, createdAt: '' }],
      activePeriodId: 'p1', loading: false, error: null,
      fetchAll: vi.fn(), reset: resetPer, setActivePeriod: vi.fn(),
    }))
    vi.mocked(useExpensesStore).mockImplementation((sel: any) => sel({
      expenses: [], loading: false, error: null, fetchAll: vi.fn(), reset: resetExp,
    }))
    vi.mocked(useRecurringExpensesStore).mockImplementation((sel: any) => sel({
      recurringExpenses: [], loading: false, error: null, fetchAll: vi.fn(), reset: resetRec,
    }))

    render(
      <MemoryRouter initialEntries={['/']}>
        <Layout />
      </MemoryRouter>
    )

    const logoutBtn = screen.getByRole('button', { name: /cerrar sesión/i })
    fireEvent.click(logoutBtn)

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledOnce()
      expect(resetCat).toHaveBeenCalledOnce()
      expect(resetPer).toHaveBeenCalledOnce()
      expect(resetExp).toHaveBeenCalledOnce()
      expect(resetRec).toHaveBeenCalledOnce()
    })
  })
})
