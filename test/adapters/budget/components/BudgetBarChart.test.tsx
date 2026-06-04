import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BudgetBarChart } from '@/adapters/budget/components/BudgetBarChart'
import type { BudgetPeriod, Expense } from '@/domain/budget/model/types'

vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }: { children?: React.ReactNode }) => <div data-testid="bar">{children}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
}))

const periods: BudgetPeriod[] = [
  { id: 'p-1', month: 1, year: 2026, netSalary: 2000, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'p-2', month: 2, year: 2026, netSalary: 2500, createdAt: '2026-02-01T00:00:00.000Z' },
]

const expenses: Expense[] = [
  { id: 'e-1', periodId: 'p-1', categoryId: 'cat-1', description: 'Test', amount: 800, date: '2026-01-10', createdAt: '2026-01-10T00:00:00.000Z' },
]

describe('BudgetBarChart', () => {
  it('renders chart when 2 or more periods exist', () => {
    render(<BudgetBarChart periods={periods} expenses={expenses} />)
    expect(screen.getByTestId('responsive-container')).toBeTruthy()
    expect(screen.getByTestId('bar-chart')).toBeTruthy()
  })

  it('renders heading "Tendencia mensual"', () => {
    render(<BudgetBarChart periods={periods} expenses={expenses} />)
    expect(screen.getByText('Tendencia mensual')).toBeTruthy()
  })

  it('renders nothing when fewer than 2 periods exist', () => {
    const { container } = render(<BudgetBarChart periods={[periods[0]]} expenses={expenses} />)
    expect(screen.queryByTestId('bar-chart')).toBeNull()
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when periods array is empty', () => {
    const { container } = render(<BudgetBarChart periods={[]} expenses={expenses} />)
    expect(container.firstChild).toBeNull()
  })
})
