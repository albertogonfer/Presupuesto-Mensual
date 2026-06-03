import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BudgetPieChart } from './BudgetPieChart'
import type { BudgetSummary } from '../../../domain/budget/model/types'

// Mock Recharts to avoid canvas errors in jsdom
vi.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: { children?: React.ReactNode }) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
}))

const mockSummary: BudgetSummary = {
  totalSpent: 300,
  remaining: 700,
  percentUsed: 30,
  byCategory: [
    {
      category: { id: 'cat-1', name: 'Comida', color: '#10B981', icon: '🍔', createdAt: '2026-01-01T00:00:00.000Z' },
      total: 200,
      percentage: 66.67,
    },
    {
      category: { id: 'cat-2', name: 'Préstamos', color: '#F59E0B', icon: '💳', createdAt: '2026-01-01T00:00:00.000Z' },
      total: 100,
      percentage: 33.33,
    },
  ],
}

const emptySummary: BudgetSummary = {
  totalSpent: 0,
  remaining: 1000,
  percentUsed: 0,
  byCategory: [],
}

describe('BudgetPieChart', () => {
  it('renders the chart when there are expenses', () => {
    render(<BudgetPieChart summary={mockSummary} />)
    expect(screen.getByTestId('responsive-container')).toBeTruthy()
    expect(screen.getByTestId('pie-chart')).toBeTruthy()
  })

  it('renders a heading "Distribución por categorías"', () => {
    render(<BudgetPieChart summary={mockSummary} />)
    expect(screen.getByText('Distribución por categorías')).toBeTruthy()
  })

  it('renders nothing (or empty state) when byCategory is empty', () => {
    const { container } = render(<BudgetPieChart summary={emptySummary} />)
    expect(screen.queryByTestId('pie-chart')).toBeNull()
    // Should show empty message
    expect(container.textContent).toContain('Sin gastos')
  })
})
