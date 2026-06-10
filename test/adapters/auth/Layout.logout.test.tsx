import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('@/adapters/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}))
vi.mock('@/adapters/budget/store/categoriesStore', () => ({
  useCategoriesStore: vi.fn(),
}))
vi.mock('@/adapters/budget/store/periodsStore', () => ({
  usePeriodsStore: vi.fn(),
}))
vi.mock('@/adapters/budget/store/expensesStore', () => ({
  useExpensesStore: vi.fn(),
}))
vi.mock('@/adapters/budget/store/recurringExpensesStore', () => ({
  useRecurringExpensesStore: vi.fn(),
}))
vi.mock('@/adapters/budget/store/profileStore', () => ({
  useProfileStore: vi.fn(),
}))

import { useAuth } from '@/adapters/auth/AuthContext'
import { Layout } from '@/adapters/budget/components/Layout'
import { useCategoriesStore } from '@/adapters/budget/store/categoriesStore'
import { usePeriodsStore } from '@/adapters/budget/store/periodsStore'
import { useExpensesStore } from '@/adapters/budget/store/expensesStore'
import { useRecurringExpensesStore } from '@/adapters/budget/store/recurringExpensesStore'
import { useProfileStore } from '@/adapters/budget/store/profileStore'

type Selector = (state: Record<string, unknown>) => unknown

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
    const resetProf = vi.fn()

    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'u1', email: 'test@test.com' },
      session: { user: { id: 'u1' } },
      loading: false,
      signIn: vi.fn(), signUp: vi.fn(), signOut,
      resetPassword: vi.fn(), updatePassword: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>)

    // State objects are created once so selector results stay referentially
    // stable across renders — otherwise Layout's fetch effect re-runs forever.
    const catState = {
      categories: [{ id: 'c1', name: 'Comida', color: '#F97316', icon: '🛒', createdAt: '' }],
      loading: false, error: null, fetchAll: vi.fn(), reset: resetCat,
    }
    const perState = {
      periods: [{ id: 'p1', month: 1, year: 2026, netSalary: 1000, createdAt: '' }],
      activePeriodId: 'p1', loading: false, error: null,
      fetchAll: vi.fn(), reset: resetPer, setActivePeriod: vi.fn(),
    }
    const expState = {
      expenses: [], loading: false, error: null, fetchAll: vi.fn(), reset: resetExp,
    }
    const recState = {
      recurringExpenses: [], loading: false, error: null, fetchAll: vi.fn(), reset: resetRec,
    }
    const profState = {
      profile: { id: 'u1', fullName: 'Test User', onboardingCompleted: true },
      loading: false, error: null, fetchProfile: vi.fn(), reset: resetProf,
    }

    vi.mocked(useCategoriesStore).mockImplementation(((sel: Selector) => sel(catState)) as never)
    vi.mocked(usePeriodsStore).mockImplementation(((sel: Selector) => sel(perState)) as never)
    vi.mocked(useExpensesStore).mockImplementation(((sel: Selector) => sel(expState)) as never)
    vi.mocked(useRecurringExpensesStore).mockImplementation(((sel: Selector) => sel(recState)) as never)
    vi.mocked(useProfileStore).mockImplementation(((sel: Selector) => sel(profState)) as never)

    render(
      <MemoryRouter initialEntries={['/']}>
        <Layout />
      </MemoryRouter>
    )

    // There are two logout buttons: desktop sidebar and mobile top bar
    const [logoutBtn] = screen.getAllByRole('button', { name: /cerrar sesión/i })
    fireEvent.click(logoutBtn)

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledOnce()
      expect(resetCat).toHaveBeenCalledOnce()
      expect(resetPer).toHaveBeenCalledOnce()
      expect(resetExp).toHaveBeenCalledOnce()
      expect(resetRec).toHaveBeenCalledOnce()
      expect(resetProf).toHaveBeenCalledOnce()
    })
  })
})
