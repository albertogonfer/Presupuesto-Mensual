import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  it('renders with a label when label prop is provided', () => {
    render(<Input label="Amount" id="amount" />)
    expect(screen.getByLabelText('Amount')).toBeInTheDocument()
  })

  it('renders with placeholder text', () => {
    render(<Input label="Description" id="desc" placeholder="Enter description" />)
    expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument()
  })

  it('calls onChange when the user types', async () => {
    const handleChange = vi.fn()
    render(<Input label="Name" id="name" onChange={handleChange} />)
    await userEvent.type(screen.getByLabelText('Name'), 'Test')
    expect(handleChange).toHaveBeenCalled()
  })

  it('displays an error message when error prop is passed', () => {
    render(<Input label="Amount" id="amount" error="Required" />)
    expect(screen.getByText('Required')).toBeInTheDocument()
  })
})
