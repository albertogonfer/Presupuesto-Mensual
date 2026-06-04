import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryCard } from '@/adapters/budget/components/CategoryCard'

const mockCategory = {
  id: 'cat-1',
  name: 'Comida',
  color: '#10B981',
  icon: '🛒',
  createdAt: '2024-01-01T00:00:00Z',
}

describe('CategoryCard', () => {
  it('displays the category name and icon', () => {
    render(<CategoryCard category={mockCategory} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Comida')).toBeInTheDocument()
    expect(screen.getByText('🛒')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn()
    render(<CategoryCard category={mockCategory} onEdit={onEdit} onDelete={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /editar/i }))
    expect(onEdit).toHaveBeenCalledWith(mockCategory)
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn()
    render(<CategoryCard category={mockCategory} onEdit={vi.fn()} onDelete={onDelete} />)
    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }))
    expect(onDelete).toHaveBeenCalledWith('cat-1')
  })
})
