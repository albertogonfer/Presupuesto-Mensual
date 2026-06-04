import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PeriodSelector } from '@/adapters/budget/components/PeriodSelector'
import type { BudgetPeriod } from '@/domain/budget/model/types'

function makePeriod(month: number, year: number, id: string): BudgetPeriod {
  return { id, month, year, netSalary: 100000, createdAt: new Date().toISOString() }
}

const PERIODS = [
  makePeriod(1, 2026, 'jan'),
  makePeriod(3, 2026, 'mar'),
  makePeriod(2, 2026, 'feb'),
]

describe('PeriodSelector', () => {
  it('shows the active period label as "Marzo 2026"', () => {
    render(
      <PeriodSelector
        periods={PERIODS}
        activePeriodId="mar"
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByText('Marzo 2026')).toBeInTheDocument()
  })

  it('disables the prev arrow when active period is the oldest', () => {
    render(
      <PeriodSelector
        periods={PERIODS}
        activePeriodId="jan"
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled()
  })

  it('disables the next arrow when active period is the newest', () => {
    render(
      <PeriodSelector
        periods={PERIODS}
        activePeriodId="mar"
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeDisabled()
  })

  it('calls onSelect with previous period id when clicking prev arrow', () => {
    const onSelect = vi.fn()
    render(
      <PeriodSelector
        periods={PERIODS}
        activePeriodId="feb"
        onSelect={onSelect}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /anterior/i }))
    expect(onSelect).toHaveBeenCalledWith('jan')
  })

  it('calls onSelect with next period id when clicking next arrow', () => {
    const onSelect = vi.fn()
    render(
      <PeriodSelector
        periods={PERIODS}
        activePeriodId="feb"
        onSelect={onSelect}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    expect(onSelect).toHaveBeenCalledWith('mar')
  })

  it('renders null when periods list is empty', () => {
    const { container } = render(
      <PeriodSelector
        periods={[]}
        activePeriodId={null}
        onSelect={vi.fn()}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows the last sorted period when activePeriodId is null', () => {
    render(
      <PeriodSelector
        periods={PERIODS}
        activePeriodId={null}
        onSelect={vi.fn()}
      />,
    )
    // sorted: jan, feb, mar — last is March
    expect(screen.getByText('Marzo 2026')).toBeInTheDocument()
  })
})
