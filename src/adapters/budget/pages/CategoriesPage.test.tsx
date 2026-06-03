import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCategoriesStore } from '../store/categoriesStore'
import CategoriesPage from '../pages/CategoriesPage'

beforeEach(() => {
  useCategoriesStore.setState({
    categories: [
      { id: 'cat-1', name: 'Comida', color: '#10B981', icon: '🛒', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'cat-2', name: 'Moto', color: '#3B82F6', icon: '🏍️', createdAt: '2024-01-02T00:00:00Z' },
    ],
    hasHydrated: true,
  })
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
})
