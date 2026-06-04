import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MonthlyComparisonChart } from '@/adapters/budget/components/MonthlyComparisonChart'
import type { PeriodComparisonRow } from '@/domain/budget/services/buildComparisonData'

vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
}))

function makeRow(overrides: Partial<PeriodComparisonRow> & { periodId: string; label: string }): PeriodComparisonRow {
  return {
    netSalary: 2000,
    totalSpent: 1200,
    remaining: 800,
    percentUsed: 60,
    ...overrides,
  }
}

const twoRows: PeriodComparisonRow[] = [
  makeRow({ periodId: 'p1', label: 'Enero 2026' }),
  makeRow({ periodId: 'p2', label: 'Febrero 2026', vsLastMonth: 100 }),
]

describe('MonthlyComparisonChart', () => {
  it('renders without crashing with valid data', () => {
    render(<MonthlyComparisonChart data={twoRows} />)
    expect(screen.getByTestId('responsive-container')).toBeTruthy()
    expect(screen.getByTestId('bar-chart')).toBeTruthy()
  })

  it('renders null when data has fewer than 2 entries', () => {
    const { container } = render(<MonthlyComparisonChart data={[twoRows[0]]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders null for empty data', () => {
    const { container } = render(<MonthlyComparisonChart data={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
