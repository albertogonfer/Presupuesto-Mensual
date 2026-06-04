import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { usePeriodsStore } from '@/adapters/budget/store/periodsStore'
import { useCategoriesStore } from '@/adapters/budget/store/categoriesStore'
import { useRecurringExpensesStore } from '@/adapters/budget/store/recurringExpensesStore'
import { useExpensesStore } from '@/adapters/budget/store/expensesStore'
import OnboardingPage from '@/adapters/budget/pages/OnboardingPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const SEED_CATEGORIES = [
  { id: 'cat-1', name: 'Comida', color: '#10B981', icon: '🛒', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cat-2', name: 'Préstamos', color: '#F59E0B', icon: '💳', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cat-3', name: 'Otros', color: '#8B5CF6', icon: '📦', createdAt: '2024-01-01T00:00:00Z' },
]

function renderPage() {
  return render(
    <MemoryRouter>
      <OnboardingPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockNavigate.mockReset()
  localStorage.clear()
  usePeriodsStore.setState({ periods: [], activePeriodId: null, hasHydrated: true })
  useCategoriesStore.setState({ categories: SEED_CATEGORIES, hasHydrated: true })
  useRecurringExpensesStore.setState({ recurringExpenses: [] })
  useExpensesStore.setState({ expenses: [], hasHydrated: true })
})

describe('OnboardingPage — step 1 (bienvenida)', () => {
  it('renders the welcome screen with the Empezar button', () => {
    renderPage()
    expect(screen.getByText(/bienvenido a presupuesto mensual/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /empezar/i })).toBeInTheDocument()
  })

  it('shows "Saltar configuración" link', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /saltar configuración/i })).toBeInTheDocument()
  })

  it('clicking Empezar advances to step 2', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /empezar/i }))
    expect(screen.getByText(/¿cuánto cobras al mes\?/i)).toBeInTheDocument()
  })

  it('"Saltar configuración" sets the flag and navigates to dashboard', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /saltar configuración/i }))
    expect(localStorage.getItem('onboarding-complete')).toBe('true')
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})

describe('OnboardingPage — step 2 (período)', () => {
  async function goToStep2() {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /empezar/i }))
  }

  it('renders the period form', async () => {
    await goToStep2()
    expect(screen.getByLabelText(/sueldo neto/i)).toBeInTheDocument()
  })

  it('shows a back button that returns to step 1', async () => {
    await goToStep2()
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.getByText(/bienvenido a presupuesto mensual/i)).toBeInTheDocument()
  })

  it('submitting the form advances to step 3', async () => {
    await goToStep2()
    const salaryInput = screen.getByLabelText(/sueldo neto/i)
    await userEvent.clear(salaryInput)
    await userEvent.type(salaryInput, '2500')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(screen.getByText(/estas son tus categorías por defecto/i)).toBeInTheDocument()
  })

  it('submitting creates a period in the store', async () => {
    await goToStep2()
    const salaryInput = screen.getByLabelText(/sueldo neto/i)
    await userEvent.clear(salaryInput)
    await userEvent.type(salaryInput, '3000')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    const periods = usePeriodsStore.getState().periods
    expect(periods).toHaveLength(1)
    expect(periods[0].netSalary).toBe(3000)
  })
})

describe('OnboardingPage — step 3 (categorías)', () => {
  async function goToStep3() {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /empezar/i }))
    const salaryInput = screen.getByLabelText(/sueldo neto/i)
    await userEvent.clear(salaryInput)
    await userEvent.type(salaryInput, '2500')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
  }

  it('renders the default category list', async () => {
    await goToStep3()
    expect(screen.getByText('Comida')).toBeInTheDocument()
    expect(screen.getByText('Préstamos')).toBeInTheDocument()
    expect(screen.getByText('Otros')).toBeInTheDocument()
  })

  it('"¡Todo listo" button sets flag and navigates to dashboard', async () => {
    await goToStep3()
    await userEvent.click(screen.getByRole('button', { name: /todo listo/i }))
    expect(localStorage.getItem('onboarding-complete')).toBe('true')
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('Eliminar removes a category from the list', async () => {
    await goToStep3()
    await userEvent.click(screen.getByRole('button', { name: /eliminar comida/i }))
    expect(screen.queryByText('Comida')).not.toBeInTheDocument()
  })

  it('"Añadir categoría" shows the inline form', async () => {
    await goToStep3()
    await userEvent.click(screen.getByText(/\+ añadir categoría/i))
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
  })

  it('inline form adds a new category', async () => {
    await goToStep3()
    await userEvent.click(screen.getByText(/\+ añadir categoría/i))
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Transporte')
    await userEvent.click(screen.getByRole('button', { name: /^añadir$/i }))
    expect(screen.getByText('Transporte')).toBeInTheDocument()
  })
})
