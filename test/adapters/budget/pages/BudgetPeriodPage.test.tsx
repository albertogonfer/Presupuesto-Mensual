import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePeriodsStore } from '@/adapters/budget/store/periodsStore'
import { useExpensesStore } from '@/adapters/budget/store/expensesStore'
import BudgetPeriodPage from '@/adapters/budget/pages/BudgetPeriodPage'

vi.mock('@/infrastructure/storage/periodsRepository', () => ({
  periodsRepository: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async (p: unknown) => p),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('@/infrastructure/storage/expensesRepository', () => ({
  expensesRepository: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async (e: unknown) => e),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    deleteByPeriod: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('@/infrastructure/storage/recurringExpensesRepository', () => ({
  recurringExpensesRepository: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async (r: unknown) => r),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  usePeriodsStore.setState({ periods: [], activePeriodId: null })
  useExpensesStore.setState({ expenses: [] })
})

describe('BudgetPeriodPage — empty state', () => {
  it('shows an onboarding empty state when no period exists', () => {
    render(<BudgetPeriodPage />)
    expect(screen.getByText(/aún no tienes ningún período configurado/i)).toBeInTheDocument()
  })

  it('shows a button to create the first period', () => {
    render(<BudgetPeriodPage />)
    expect(screen.getByRole('button', { name: /nuevo período/i })).toBeInTheDocument()
  })
})

describe('BudgetPeriodPage — with active period', () => {
  beforeEach(() => {
    usePeriodsStore.setState({
      periods: [
        {
          id: 'p1',
          month: 6,
          year: 2026,
          netSalary: 350000,
          createdAt: '2026-06-01T00:00:00Z',
        },
      ],
      activePeriodId: 'p1',
    })
  })

  it('renders the active period month and year', () => {
    render(<BudgetPeriodPage />)
    expect(screen.getByText(/junio 2026/i)).toBeInTheDocument()
  })

  it('renders the net salary', () => {
    render(<BudgetPeriodPage />)
    expect(screen.getByText(/350\.000/)).toBeInTheDocument()
  })

  it('shows an edit button', () => {
    render(<BudgetPeriodPage />)
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument()
  })
})

describe('BudgetPeriodPage — create period flow', () => {
  it('opens the period form modal when the create button is clicked', async () => {
    render(<BudgetPeriodPage />)
    await userEvent.click(screen.getByRole('button', { name: /nuevo período/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('creates a period and shows it after form submission', async () => {
    render(<BudgetPeriodPage />)
    await userEvent.click(screen.getByRole('button', { name: /nuevo período/i }))

    // Fill month select
    const monthSelect = screen.getByLabelText(/mes/i)
    await userEvent.selectOptions(monthSelect, '6')

    // Fill year input
    const yearInput = screen.getByLabelText(/año/i)
    await userEvent.clear(yearInput)
    await userEvent.type(yearInput, '2026')

    // Fill salary
    const salaryInput = screen.getByLabelText(/sueldo neto/i)
    await userEvent.clear(salaryInput)
    await userEvent.type(salaryInput, '350000')

    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(screen.getByText(/junio 2026/i)).toBeInTheDocument()
  })
})

describe('BudgetPeriodPage — period form prefill', () => {
  it('opens empty salary when no prior periods exist', async () => {
    render(<BudgetPeriodPage />)
    await userEvent.click(screen.getByRole('button', { name: /nuevo período/i }))
    const salaryInput = screen.getByRole('spinbutton', { name: /sueldo neto/i })
    expect(salaryInput).toHaveValue(null)
  })

  it('pre-fills netSalary from the most recent period', async () => {
    usePeriodsStore.setState({
      periods: [{ id: 'p1', month: 5, year: 2026, netSalary: 2500, createdAt: '2026-05-01T00:00:00Z' }],
      activePeriodId: 'p1',
    })
    render(<BudgetPeriodPage />)
    await userEvent.click(screen.getByRole('button', { name: /nuevo período/i }))
    expect(screen.getByRole('spinbutton', { name: /sueldo neto/i })).toHaveValue(2500)
  })

  it('pre-fills savingsGoal when most recent period has one', async () => {
    usePeriodsStore.setState({
      periods: [{ id: 'p1', month: 5, year: 2026, netSalary: 2500, savingsGoal: 400, createdAt: '2026-05-01T00:00:00Z' }],
      activePeriodId: 'p1',
    })
    render(<BudgetPeriodPage />)
    await userEvent.click(screen.getByRole('button', { name: /nuevo período/i }))
    expect(screen.getByRole('checkbox', { name: /establecer objetivo de ahorro/i })).toBeChecked()
    expect(screen.getByRole('spinbutton', { name: /^objetivo de ahorro$/i })).toHaveValue(400)
  })

  it('pre-fills month/year as next month after most recent period', async () => {
    usePeriodsStore.setState({
      periods: [{ id: 'p1', month: 5, year: 2026, netSalary: 2500, createdAt: '2026-05-01T00:00:00Z' }],
      activePeriodId: 'p1',
    })
    render(<BudgetPeriodPage />)
    await userEvent.click(screen.getByRole('button', { name: /nuevo período/i }))
    expect(screen.getByLabelText(/mes/i)).toHaveValue('6')
    expect(screen.getByRole('spinbutton', { name: /año/i })).toHaveValue(2026)
  })

  it('pre-fills January of next year when most recent period is December', async () => {
    usePeriodsStore.setState({
      periods: [{ id: 'p1', month: 12, year: 2026, netSalary: 3000, createdAt: '2026-12-01T00:00:00Z' }],
      activePeriodId: 'p1',
    })
    render(<BudgetPeriodPage />)
    await userEvent.click(screen.getByRole('button', { name: /nuevo período/i }))
    expect(screen.getByLabelText(/mes/i)).toHaveValue('1')
    expect(screen.getByRole('spinbutton', { name: /año/i })).toHaveValue(2027)
  })
})
