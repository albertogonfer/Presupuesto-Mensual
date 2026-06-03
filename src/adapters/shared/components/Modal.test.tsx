import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

describe('Modal', () => {
  it('renders children when open is true', () => {
    render(
      <Modal open title="Add Category" onClose={vi.fn()}>
        <p>Modal content</p>
      </Modal>,
    )
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('renders the title when open', () => {
    render(
      <Modal open title="Add Category" onClose={vi.fn()}>
        <p>content</p>
      </Modal>,
    )
    expect(screen.getByText('Add Category')).toBeInTheDocument()
  })

  it('does not render children when open is false', () => {
    render(
      <Modal open={false} title="Add Category" onClose={vi.fn()}>
        <p>Hidden content</p>
      </Modal>,
    )
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    const handleClose = vi.fn()
    render(
      <Modal open title="Add Category" onClose={handleClose}>
        <p>content</p>
      </Modal>,
    )
    await userEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
