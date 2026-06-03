import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { buildPieData } from '../../../domain/budget/services/chartTransformers'
import type { BudgetSummary } from '../../../domain/budget/model/types'

type BudgetPieChartProps = {
  summary: BudgetSummary
}

export function BudgetPieChart({ summary }: BudgetPieChartProps) {
  const data = buildPieData(summary)

  if (data.length === 0) {
    return (
      <div className="rounded-card bg-bg-card p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Distribución por categorías
        </h2>
        <p className="text-center text-sm text-text-secondary">Sin gastos registrados</p>
      </div>
    )
  }

  return (
    <div className="rounded-card bg-bg-card p-6 shadow-card">
      <h2 className="mb-4 text-lg font-semibold text-text-primary">
        Distribución por categorías
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'EUR',
              }).format(value)
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
