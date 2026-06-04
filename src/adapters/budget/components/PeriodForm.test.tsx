import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PeriodForm } from './PeriodForm'

// Helper to get the savings goal number input specifically
function getSavingsInput() {
  return screen.getByRole('spinbutton', { name: /^objetivo de ahorro$/i })
}
function querySavingsInput() {
  return screen.queryByRole('spinbutton', { name: /^objetivo de ahorro$/i })
}

describe('PeriodForm — prefill hint', () => {
  it('shows the prefill hint when prefillHint is true and salary has not been edited', () => {
    render(
      <PeriodForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        initialValues={{ month: 5, year: 2026, netSalary: 2500 }}
        prefillHint
      />,
    )
    expect(screen.getByText(/igual que el período anterior/i)).toBeInTheDocument()
  })

  it('hides the prefill hint when the user edits the salary', async () => {
    render(
      <PeriodForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        initialValues={{ month: 5, year: 2026, netSalary: 2500 }}
        prefillHint
      />,
    )
    const salaryInput = screen.getByRole('spinbutton', { name: /sueldo neto/i })
    await userEvent.clear(salaryInput)
    await userEvent.type(salaryInput, '3000')
    expect(screen.queryByText(/igual que el período anterior/i)).not.toBeInTheDocument()
  })

  it('does not show the prefill hint when prefillHint is false', () => {
    render(
      <PeriodForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        initialValues={{ month: 5, year: 2026, netSalary: 2500 }}
      />,
    )
    expect(screen.queryByText(/igual que el período anterior/i)).not.toBeInTheDocument()
  })
})

describe('PeriodForm — savings goal', () => {
  it('does not show savings goal input by default', () => {
    render(<PeriodForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(querySavingsInput()).not.toBeInTheDocument()
  })

  it('shows savings goal input when checkbox is checked', async () => {
    render(<PeriodForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    const checkbox = screen.getByRole('checkbox', { name: /establecer objetivo de ahorro/i })
    await userEvent.click(checkbox)
    expect(getSavingsInput()).toBeInTheDocument()
  })

  it('hides savings goal input when checkbox is unchecked again', async () => {
    render(<PeriodForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    const checkbox = screen.getByRole('checkbox', { name: /establecer objetivo de ahorro/i })
    await userEvent.click(checkbox)
    expect(getSavingsInput()).toBeInTheDocument()
    await userEvent.click(checkbox)
    expect(querySavingsInput()).not.toBeInTheDocument()
  })

  it('submits savingsGoal value when checkbox is checked and input is filled', async () => {
    const onSubmit = vi.fn()
    render(<PeriodForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.click(screen.getByRole('checkbox', { name: /establecer objetivo de ahorro/i }))
    await userEvent.clear(getSavingsInput())
    await userEvent.type(getSavingsInput(), '500')

    // Fill required fields
    await userEvent.clear(screen.getByRole('spinbutton', { name: /sueldo neto/i }))
    await userEvent.type(screen.getByRole('spinbutton', { name: /sueldo neto/i }), '2500')

    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ savingsGoal: 500 }),
    )
  })

  it('submits undefined savingsGoal when checkbox is unchecked', async () => {
    const onSubmit = vi.fn()
    render(<PeriodForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.clear(screen.getByRole('spinbutton', { name: /sueldo neto/i }))
    await userEvent.type(screen.getByRole('spinbutton', { name: /sueldo neto/i }), '2500')

    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ savingsGoal: undefined }),
    )
  })

  it('pre-fills checkbox and input when initialValues has savingsGoal', () => {
    render(
      <PeriodForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        initialValues={{ month: 6, year: 2026, netSalary: 2500, savingsGoal: 300 }}
      />,
    )
    const checkbox = screen.getByRole('checkbox', { name: /establecer objetivo de ahorro/i })
    expect(checkbox).toBeChecked()
    expect(getSavingsInput()).toHaveValue(300)
  })
})
