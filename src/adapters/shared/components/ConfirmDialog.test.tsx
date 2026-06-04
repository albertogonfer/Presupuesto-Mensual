import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders title and message when open', () => {
    render(
      <ConfirmDialog
        open
        title="¿Eliminar categoría?"
        message="Comida"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByText('¿Eliminar categoría?')).toBeInTheDocument()
    expect(screen.getByText('Comida')).toBeInTheDocument()
  })

  it('does not render when open is false', () => {
    render(
      <ConfirmDialog
        open={false}
        title="¿Eliminar categoría?"
        message="Comida"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.queryByText('¿Eliminar categoría?')).not.toBeInTheDocument()
  })

  it('calls onConfirm when Eliminar button is clicked', async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        open
        title="¿Eliminar categoría?"
        message="Comida"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when Cancelar button is clicked', async () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open
        title="¿Eliminar categoría?"
        message="Comida"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
