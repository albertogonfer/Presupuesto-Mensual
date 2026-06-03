import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryForm } from './CategoryForm'

describe('CategoryForm', () => {
  it('renders name, icon, and color inputs', () => {
    render(<CategoryForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ícono/i)).toBeInTheDocument()
    expect(screen.getByText(/color/i)).toBeInTheDocument()
  })

  it('calls onSubmit with name, icon, and color when form is submitted', async () => {
    const onSubmit = vi.fn()
    render(<CategoryForm onSubmit={onSubmit} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Transporte')
    await userEvent.clear(screen.getByLabelText(/ícono/i))
    await userEvent.type(screen.getByLabelText(/ícono/i), '🚌')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Transporte', icon: '🚌' }),
    )
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn()
    render(<CategoryForm onSubmit={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('pre-fills form fields when initialValues are provided', () => {
    render(
      <CategoryForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        initialValues={{ name: 'Edit Me', color: '#FF0000', icon: '✏️' }}
      />,
    )
    expect(screen.getByDisplayValue('Edit Me')).toBeInTheDocument()
    expect(screen.getByDisplayValue('✏️')).toBeInTheDocument()
  })
})
