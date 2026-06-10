import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExpenseForm } from '@/adapters/budget/components/ExpenseForm'

const CATEGORIES = [
  { id: 'c1', name: 'Comida', color: '#34d399', icon: '🛒', createdAt: '2026-01-01T00:00:00Z' },
]

describe('ExpenseForm — recurring section', () => {
  it('shows the recurring toggle when adding a new expense', () => {
    render(<ExpenseForm categories={CATEGORIES} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/gasto recurrente/i)).toBeInTheDocument()
  })

  it('hides the recurring toggle when editing an existing expense', () => {
    render(
      <ExpenseForm
        categories={CATEGORIES}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        initialValues={{ description: 'Cena', amount: 30, categoryId: 'c1', date: '2026-06-01' }}
      />,
    )
    expect(screen.queryByLabelText(/gasto recurrente/i)).not.toBeInTheDocument()
  })

  it('submits without recurring payload when the toggle is off', async () => {
    const onSubmit = vi.fn()
    render(<ExpenseForm categories={CATEGORIES} onSubmit={onSubmit} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/descripción/i), 'Mercadona')
    await userEvent.type(screen.getByLabelText(/importe/i), '25')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Mercadona', amount: 25, recurring: undefined }),
    )
  })

  it('reveals frequency options and submits recurring payload when toggled on', async () => {
    const onSubmit = vi.fn()
    render(<ExpenseForm categories={CATEGORIES} onSubmit={onSubmit} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/descripción/i), 'Gimnasio')
    await userEvent.type(screen.getByLabelText(/importe/i), '35')
    await userEvent.click(screen.getByLabelText(/gasto recurrente/i))

    expect(screen.getByRole('radiogroup', { name: /frecuencia/i })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: /semanal/i }))
    const everyInput = screen.getByLabelText(/cada/i)
    await userEvent.clear(everyInput)
    await userEvent.type(everyInput, '2')

    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Gimnasio',
        amount: 35,
        recurring: { frequency: 'weekly', every: 2, endsAt: undefined, finalPaymentAmount: undefined },
      }),
    )
  })

  it('includes end date and final payment when their toggles are on', async () => {
    const onSubmit = vi.fn()
    render(<ExpenseForm categories={CATEGORIES} onSubmit={onSubmit} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/descripción/i), 'Préstamo')
    await userEvent.type(screen.getByLabelText(/importe/i), '120')
    await userEvent.click(screen.getByLabelText(/gasto recurrente/i))
    await userEvent.click(screen.getByLabelText(/fecha de fin/i))
    await userEvent.type(screen.getByLabelText(/fecha de fin de la recurrencia/i), '2026-12-31')
    await userEvent.click(screen.getByLabelText(/cuota final distinta/i))
    await userEvent.type(screen.getByLabelText(/importe de la cuota final/i), '300')

    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        recurring: { frequency: 'monthly', every: 1, endsAt: '2026-12-31', finalPaymentAmount: 300 },
      }),
    )
  })
})

describe('ExpenseForm — recurring validation', () => {
  it('rejects an end-date toggle without a date', async () => {
    const onSubmit = vi.fn()
    render(<ExpenseForm categories={CATEGORIES} onSubmit={onSubmit} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/descripción/i), 'Luz')
    await userEvent.type(screen.getByLabelText(/importe/i), '60')
    await userEvent.click(screen.getByLabelText(/gasto recurrente/i))
    await userEvent.click(screen.getByLabelText(/fecha de fin/i))
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/fecha de fin/i)
  })
})
