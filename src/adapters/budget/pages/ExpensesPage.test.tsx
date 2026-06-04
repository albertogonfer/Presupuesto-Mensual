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
    expect(screen.getAllByText('Comida').length).toBeGreaterThanOrEqual(1)
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

describe('ExpensesPage — filter, search and sort', () => {
  const CATEGORY_2 = { id: 'cat-2', name: 'Transporte', color: '#3B82F6', icon: '🚌', createdAt: '2026-01-01T00:00:00Z' }
  const BASE_EXPENSES = [
    { id: 'exp-1', periodId: 'period-1', categoryId: 'cat-1', description: 'Compra supermercado', amount: 50, date: '2026-06-03', createdAt: '2026-06-03T10:00:00Z' },
    { id: 'exp-2', periodId: 'period-1', categoryId: 'cat-2', description: 'Abono transporte', amount: 20, date: '2026-06-01', createdAt: '2026-06-01T10:00:00Z' },
    { id: 'exp-3', periodId: 'period-1', categoryId: 'cat-1', description: 'Restaurante', amount: 35, date: '2026-06-02', createdAt: '2026-06-02T10:00:00Z' },
  ]

  beforeEach(() => {
    useCategoriesStore.setState({ categories: [CATEGORY, CATEGORY_2], hasHydrated: true })
    useExpensesStore.setState({ expenses: BASE_EXPENSES, hasHydrated: true })
  })

  it('filter by category shows only expenses of that category', async () => {
    render(<ExpensesPage />)
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /categoría/i }), 'cat-1')
    expect(screen.getByText('Compra supermercado')).toBeInTheDocument()
    expect(screen.getByText('Restaurante')).toBeInTheDocument()
    expect(screen.queryByText('Abono transporte')).not.toBeInTheDocument()
  })

  it('text search filters by description case-insensitively', async () => {
    render(<ExpensesPage />)
    await userEvent.type(screen.getByRole('textbox', { name: /buscar/i }), 'super')
    expect(screen.getByText('Compra supermercado')).toBeInTheDocument()
    expect(screen.queryByText('Abono transporte')).not.toBeInTheDocument()
    expect(screen.queryByText('Restaurante')).not.toBeInTheDocument()
  })

  it('sort by amount descending shows highest first', async () => {
    render(<ExpensesPage />)
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /ordenar/i }), 'amount-desc')
    const descriptions = screen.getAllByRole('button', { name: /^editar /i }).map((btn) =>
      btn.getAttribute('aria-label')?.replace('Editar ', '')
    )
    expect(descriptions[0]).toBe('Compra supermercado')
    expect(descriptions[1]).toBe('Restaurante')
    expect(descriptions[2]).toBe('Abono transporte')
  })

  it('shows result counter when a category filter is active', async () => {
    render(<ExpensesPage />)
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /categoría/i }), 'cat-2')
    expect(screen.getByText(/1 de 3 gastos/i)).toBeInTheDocument()
  })

  it('shows result counter when text search is active', async () => {
    render(<ExpensesPage />)
    await userEvent.type(screen.getByRole('textbox', { name: /buscar/i }), 'abono')
    expect(screen.getByText(/1 de 3 gastos/i)).toBeInTheDocument()
  })

  it('does not show result counter when no filters are active', () => {
    render(<ExpensesPage />)
    expect(screen.queryByText(/de 3 gastos/i)).not.toBeInTheDocument()
  })
})

describe('ExpensesPage — no active period', () => {
  it('shows a message to configure a period first', () => {
    usePeriodsStore.setState({ periods: [], activePeriodId: null, hasHydrated: true })
    render(<ExpensesPage />)
    expect(screen.getByText(/configura un período/i)).toBeInTheDocument()
  })
})
