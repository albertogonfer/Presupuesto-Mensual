import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { DailyCumulativeDataPoint } from '../../../domain/budget/services/chartTransformers'

type DailyCumulativeChartProps = {
  data: DailyCumulativeDataPoint[]
}

const EVERY_5TH_TICKS = [1, 5, 10, 15, 20, 25, 30]

function formatEur(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function DailyCumulativeChart({ data }: DailyCumulativeChartProps) {
  if (data.length === 0) return null

  return (
    <div className="rounded-card bg-bg-card p-6 shadow-card">
      <h2 className="mb-4 text-lg font-semibold text-text-primary">
        Gasto acumulado diario
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="day"
            ticks={EVERY_5TH_TICKS}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={formatEur}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              formatEur(value),
              name === 'cumulative' ? 'Gastado' : 'Presupuesto',
            ]}
            labelFormatter={(label: number) => `Día ${label}`}
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '0.75rem',
            }}
          />
          <Legend
            formatter={(value: string) =>
              value === 'cumulative' ? 'Gasto acumulado' : 'Presupuesto'
            }
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            name="cumulative"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#colorCumulative)"
          />
          <Area
            type="monotone"
            dataKey="budget"
            name="budget"
            stroke="#94a3b8"
            strokeDasharray="5 5"
            strokeWidth={1.5}
            fill="none"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
