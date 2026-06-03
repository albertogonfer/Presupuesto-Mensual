import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePeriodsStore } from '../store/periodsStore'
import BudgetPeriodPage from '../pages/BudgetPeriodPage'

beforeEach(() => {
  usePeriodsStore.setState({ periods: [], activePeriodId: null, hasHydrated: true })
})

describe('BudgetPeriodPage — empty state', () => {
  it('shows an onboarding empty state when no period exists', () => {
    render(<BudgetPeriodPage />)
    expect(screen.getByText(/configurá tu primer período/i)).toBeInTheDocument()
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
      hasHydrated: true,
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
