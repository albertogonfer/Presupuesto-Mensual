import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCategoriesStore } from '@/adapters/budget/store/categoriesStore'
import { useExpensesStore } from '@/adapters/budget/store/expensesStore'
import CategoriesPage from '@/adapters/budget/pages/CategoriesPage'

vi.mock('@/infrastructure/storage/categoriesRepository', () => ({
  categoriesRepository: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async (c: unknown) => c),
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

beforeEach(() => {
  vi.clearAllMocks()
  useCategoriesStore.setState({
    categories: [
      { id: 'cat-1', name: 'Comida', color: '#10B981', icon: '🛒', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'cat-2', name: 'Moto', color: '#3B82F6', icon: '🏍️', createdAt: '2024-01-02T00:00:00Z' },
    ],
  })
  useExpensesStore.setState({ expenses: [] })
})

describe('CategoriesPage', () => {
  it('renders the list of categories', () => {
    render(<CategoriesPage />)
    expect(screen.getByText('Comida')).toBeInTheDocument()
    expect(screen.getByText('Moto')).toBeInTheDocument()
  })

  it('shows a button to add a new category', () => {
    render(<CategoriesPage />)
    expect(screen.getByRole('button', { name: /nueva categoría/i })).toBeInTheDocument()
  })

  it('opens the add form modal when the add button is clicked', async () => {
    render(<CategoriesPage />)
    await userEvent.click(screen.getByRole('button', { name: /nueva categoría/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('adds a new category when form is submitted', async () => {
    render(<CategoriesPage />)
    await userEvent.click(screen.getByRole('button', { name: /nueva categoría/i }))
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Transporte')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(screen.getByText('Transporte')).toBeInTheDocument()
  })

  it('opens confirm dialog when delete is clicked', async () => {
    render(<CategoriesPage />)
    await userEvent.click(screen.getByRole('button', { name: /eliminar comida/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/¿eliminar categoría\?/i)).toBeInTheDocument()
  })

  it('removes category after confirming deletion', async () => {
    render(<CategoriesPage />)
    await userEvent.click(screen.getByRole('button', { name: /eliminar comida/i }))
    // Click the confirm "Eliminar" button inside the dialog
    const confirmBtn = screen.getByRole('button', { name: /^eliminar$/i })
    await userEvent.click(confirmBtn)
    expect(screen.queryByText('Comida')).not.toBeInTheDocument()
  })

  it('keeps category when deletion is cancelled', async () => {
    render(<CategoriesPage />)
    await userEvent.click(screen.getByRole('button', { name: /eliminar comida/i }))
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.getByText('Comida')).toBeInTheDocument()
  })
})

describe('CategoriesPage — budget limit field', () => {
  it('shows limit input in the form', async () => {
    render(<CategoriesPage />)
    await userEvent.click(screen.getByRole('button', { name: /nueva categoría/i }))
    expect(screen.getByLabelText(/límite mensual/i)).toBeInTheDocument()
  })

  it('submitting with a limit saves it to the category', async () => {
    render(<CategoriesPage />)
    await userEvent.click(screen.getByRole('button', { name: /nueva categoría/i }))
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Transporte')
    await userEvent.clear(screen.getByLabelText(/límite mensual/i))
    await userEvent.type(screen.getByLabelText(/límite mensual/i), '200')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    const cats = useCategoriesStore.getState().categories
    const newCat = cats.find((c) => c.name === 'Transporte')
    expect(newCat?.limit).toBe(200)
  })

  it('submitting without a limit saves category with no limit (undefined)', async () => {
    render(<CategoriesPage />)
    await userEvent.click(screen.getByRole('button', { name: /nueva categoría/i }))
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Ocio')
    // leave limit blank
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    const cats = useCategoriesStore.getState().categories
    const newCat = cats.find((c) => c.name === 'Ocio')
    expect(newCat?.limit).toBeUndefined()
  })
})
