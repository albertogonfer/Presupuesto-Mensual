import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DailyCumulativeChart } from './DailyCumulativeChart'

vi.mock('recharts', () => ({
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: ({ children }: { children?: React.ReactNode }) => <div data-testid="area">{children}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
}))

const validData = [
  { day: 1, cumulative: 0, budget: 2000 },
  { day: 2, cumulative: 100, budget: 2000 },
  { day: 3, cumulative: 300, budget: 2000 },
]

describe('DailyCumulativeChart', () => {
  it('renders without crashing with valid data', () => {
    render(<DailyCumulativeChart data={validData} />)
    expect(screen.getByTestId('responsive-container')).toBeTruthy()
    expect(screen.getByTestId('area-chart')).toBeTruthy()
  })

  it('renders the chart title', () => {
    render(<DailyCumulativeChart data={validData} />)
    expect(screen.getByText('Gasto acumulado diario')).toBeTruthy()
  })

  it('renders nothing when data is empty', () => {
    const { container } = render(<DailyCumulativeChart data={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
