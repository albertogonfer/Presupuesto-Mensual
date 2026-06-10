import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryForm } from '@/adapters/budget/components/CategoryForm'

describe('CategoryForm', () => {
  it('renders name input, icon picker, and color swatches', () => {
    render(<CategoryForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: /ícono/i })).toBeInTheDocument()
    expect(screen.getByText(/color/i)).toBeInTheDocument()
  })

  it('calls onSubmit with name, selected icon, and color when form is submitted', async () => {
    const onSubmit = vi.fn()
    render(<CategoryForm onSubmit={onSubmit} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Transporte')
    await userEvent.click(screen.getByRole('radio', { name: 'Transporte' }))
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Transporte', icon: 'bus' }),
    )
  })

  it('defaults the icon to "package"', async () => {
    const onSubmit = vi.fn()
    render(<CategoryForm onSubmit={onSubmit} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Varios')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ icon: 'package' }))
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn()
    render(<CategoryForm onSubmit={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('pre-fills fields and keeps a legacy emoji icon selectable when editing', async () => {
    const onSubmit = vi.fn()
    render(
      <CategoryForm
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        initialValues={{ name: 'Edit Me', color: '#FF0000', icon: '✏️' }}
      />,
    )
    expect(screen.getByDisplayValue('Edit Me')).toBeInTheDocument()
    // The legacy emoji appears as an extra selected option in the picker
    expect(screen.getByRole('radio', { name: /ícono actual/i })).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ icon: '✏️' }))
  })
})
