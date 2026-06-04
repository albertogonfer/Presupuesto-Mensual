import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useExpensesStore } from '../store/expensesStore'
import { usePeriodsStore } from '../store/periodsStore'
import { useCategoriesStore } from '../store/categoriesStore'
import ExpensesPage from './ExpensesPage'

const CATEGORY = { id: 'cat-1', name: 'Comida', color: '#10B981', icon: '🛒', createdAt: '2026-01-01T00:00:00Z' }
const PERIOD = { id: 'period-1', month: 6, year: 2026, netSalary: 2000, createdAt: '2026-06-01T00:00:00Z' }

beforeEach(() => {
  useCategoriesStore.setState({ categories: [CATEGORY], hasHydrated: true })
  usePeriodsStore.setState({ periods: [PERIOD], activePeriodId: 'period-1', hasHydrated: true })
  useExpensesStore.setState({ expenses: [], hasHydrated: true })
})

describe('ExpensesPage — active period', () => {
  it('renders the page heading', () => {
    render(<ExpensesPage />)
    expect(screen.getByRole('heading', { name: /gastos/i })).toBeInTheDocument()
  })

  it('shows empty state when no expenses exist', () => {
    render(<ExpensesPage />)
    expect(screen.getByText(/añade tu primer gasto/i)).toBeInTheDocument()
  })

  it('shows a button to add an expense', () => {
    render(<ExpensesPage />)
    expect(screen.getByRole('button', { name: /nuevo gasto/i })).toBeInTheDocument()
  })

  it('opens the expense form modal when add button is clicked', async () => {
    render(<ExpensesPage />)
    await userEvent.click(screen.getByRole('button', { name: /nuevo gasto/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders an existing expense description and formatted amount', () => {
    useExpensesStore.setState({
      expenses: [{
        id: 'exp-1',
        periodId: 'period-1',
        categoryId: 'cat-1',
        description: 'Compra supermercado',
        amount: 50.5,
        date: '2026-06-01',
        createdAt: '2026-06-01T10:00:00Z',
      }],
      hasHydrated: true,
    })
    render(<ExpensesPage />)
    expect(screen.getByText('Compra supermercado')).toBeInTheDocument()
    // es-ES currency format: 50,50 €
    expect(screen.getByText('50,50 €')).toBeInTheDocument()
  })

  it('shows the category name badge for an expense', () => {
    useExpensesStore.setState({
      expenses: [{
        id: 'exp-1',
        periodId: 'period-1',
        categoryId: 'cat-1',
        description: 'Comida del mes',
        amount: 80,
        date: '2026-06-01',
        createdAt: '2026-06-01T10:00:00Z',
      }],
      hasHydrated: true,
    })
    render(<ExpensesPage />)
    expect(screen.getByText('Comida')).toBeInTheDocument()
  })

  it('opens confirm dialog when delete button is clicked', async () => {
    useExpensesStore.setState({
      expenses: [{
        id: 'exp-1',
        periodId: 'period-1',
        categoryId: 'cat-1',
        description: 'Para borrar',
        amount: 10,
        date: '2026-06-01',
        createdAt: '2026-06-01T10:00:00Z',
      }],
      hasHydrated: true,
    })
    render(<ExpensesPage />)
    await userEvent.click(screen.getByRole('button', { name: /eliminar para borrar/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/¿eliminar gasto\?/i)).toBeInTheDocument()
  })

  it('removes an expense after confirming deletion', async () => {
    useExpensesStore.setState({
      expenses: [{
        id: 'exp-1',
        periodId: 'period-1',
        categoryId: 'cat-1',
        description: 'Para borrar',
        amount: 10,
        date: '2026-06-01',
        createdAt: '2026-06-01T10:00:00Z',
      }],
      hasHydrated: true,
    })
    render(<ExpensesPage />)
    await userEvent.click(screen.getByRole('button', { name: /eliminar para borrar/i }))
    await userEvent.click(screen.getByRole('button', { name: /^eliminar$/i }))
    expect(screen.queryByText('Para borrar')).not.toBeInTheDocument()
  })

  it('keeps expense when deletion is cancelled', async () => {
    useExpensesStore.setState({
      expenses: [{
        id: 'exp-1',
        periodId: 'period-1',
        categoryId: 'cat-1',
        description: 'Para borrar',
        amount: 10,
        date: '2026-06-01',
        createdAt: '2026-06-01T10:00:00Z',
      }],
      hasHydrated: true,
    })
    render(<ExpensesPage />)
    await userEvent.click(screen.getByRole('button', { name: /eliminar para borrar/i }))
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.getByText('Para borrar')).toBeInTheDocument()
  })
})

describe('ExpensesPage — no active period', () => {
  it('shows a message to configure a period first', () => {
    usePeriodsStore.setState({ periods: [], activePeriodId: null, hasHydrated: true })
    render(<ExpensesPage />)
    expect(screen.getByText(/configura un período/i)).toBeInTheDocument()
  })
})
