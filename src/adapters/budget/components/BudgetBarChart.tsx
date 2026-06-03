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
import { buildBarData } from '../../../domain/budget/services/chartTransformers'
import type { BudgetPeriod, Expense } from '../../../domain/budget/model/types'

type BudgetBarChartProps = {
  periods: BudgetPeriod[]
  expenses: Expense[]
}

export function BudgetBarChart({ periods, expenses }: BudgetBarChartProps) {
  if (periods.length < 2) return null

  const data = buildBarData(periods, expenses)

  return (
    <div className="rounded-card bg-bg-card p-6 shadow-card">
      <h2 className="mb-4 text-lg font-semibold text-text-primary">
        Tendencia mensual
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(v: number) =>
              new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0,
              }).format(v)
            }
          />
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'EUR',
              }).format(value)
            }
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '0.75rem' }}
          />
          <Legend />
          <Bar dataKey="gastado" name="Gastado" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="presupuesto" name="Presupuesto" fill="#64748b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
