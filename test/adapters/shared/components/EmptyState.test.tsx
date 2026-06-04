import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '@/adapters/shared/components/EmptyState'

describe('EmptyState', () => {
  it('renders the message text', () => {
    render(<EmptyState message="No categories yet" />)
    expect(screen.getByText('No categories yet')).toBeInTheDocument()
  })

  it('renders an optional action button when actionLabel and onAction are provided', () => {
    render(
      <EmptyState
        message="No expenses"
        actionLabel="Add expense"
        onAction={() => undefined}
      />,
    )
    expect(screen.getByRole('button', { name: 'Add expense' })).toBeInTheDocument()
  })

  it('does not render a button when no actionLabel is provided', () => {
    render(<EmptyState message="Nothing here" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
