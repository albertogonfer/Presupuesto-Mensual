import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { PeriodComparisonRow } from '../../../domain/budget/services/buildComparisonData'

type MonthlyComparisonChartProps = {
  data: PeriodComparisonRow[]
}

function shortLabel(label: string): string {
  // "Junio 2026" → "Jun 26"
  const parts = label.split(' ')
  if (parts.length !== 2) return label
  return `${parts[0].slice(0, 3)} ${parts[1].slice(2)}`
}

function formatEur(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function MonthlyComparisonChart({ data }: MonthlyComparisonChartProps) {
  if (data.length < 2) return null

  const hasSavingsGoal = data.some((row) => row.savedVsGoal !== undefined)

  // savingsGoal bar = netSalary - savingsGoal (the target spending ceiling)
  const goalChartData = data.map((row) => {
    const base: Record<string, unknown> = {
      name: shortLabel(row.label),
      netSalary: row.netSalary,
      totalSpent: row.totalSpent,
    }
    if (hasSavingsGoal) {
      // If there's a savingsGoal, the "objetivo" is netSalary - savingsGoal
      const period = row
      if (period.savedVsGoal !== undefined) {
        base.objetivoAhorro = period.netSalary - (period.remaining - period.savedVsGoal)
      }
    }
    return base
  })

  return (
    <div data-testid="monthly-comparison-chart">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={goalChartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={formatEur} />
          <Tooltip
            formatter={(value: number) => formatEur(value)}
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '0.75rem',
            }}
          />
          <Legend />
          <Bar dataKey="netSalary" name="Sueldo neto" fill="#64748b" />
          <Bar dataKey="totalSpent" name="Total gastado" fill="#6366f1" />
          {hasSavingsGoal && (
            <Bar dataKey="objetivoAhorro" name="Objetivo ahorro" fill="#22c55e" />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
