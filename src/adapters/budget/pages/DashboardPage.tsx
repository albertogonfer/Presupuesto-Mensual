import { usePeriodsStore } from '../store/periodsStore'
import { useBudgetSummary } from '../hooks/useBudgetSummary'
import { SummaryCard } from '../components/SummaryCard'
import { EmptyState } from '../../shared/components/EmptyState'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function formatEur(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function DashboardPage() {
  const activePeriodId = usePeriodsStore((s) => s.activePeriodId)
  const periods = usePeriodsStore((s) => s.periods)
  const activePeriod = periods.find((p) => p.id === activePeriodId) ?? null
  const summary = useBudgetSummary()

  if (!activePeriod || !summary) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
        <EmptyState
          message="Configura un período con tu sueldo antes de ver el resumen."
          actionLabel="Ir a Configuración"
          onAction={() => { window.location.href = '/settings' }}
        />
      </div>
    )
  }

  const monthName = MONTH_NAMES[activePeriod.month - 1]
  const remainingVariant = summary.remaining >= 0 ? 'success' : 'danger'

  return (
    <div className="flex flex-col gap-6">
      {/* Header card */}
      <div className="rounded-card bg-bg-card p-6 shadow-card">
        <h1 className="text-2xl font-semibold text-text-primary">
          {monthName} {activePeriod.year}
        </h1>
        <p className="mt-1 text-text-secondary">
          Sueldo neto: <span className="font-medium text-text-primary">{formatEur(activePeriod.netSalary)}</span>
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Total gastado" value={formatEur(summary.totalSpent)} />
        <SummaryCard
          label="Dinero restante"
          value={formatEur(summary.remaining)}
          variant={remainingVariant}
        />
        <SummaryCard
          label="Porcentaje utilizado"
          value={`${summary.percentUsed.toFixed(1)} %`}
          variant={summary.percentUsed > 100 ? 'danger' : 'default'}
        />
      </div>

      {/* Category breakdown */}
      {summary.byCategory.length === 0 ? (
        <EmptyState message="Aún no tienes gastos registrados" />
      ) : (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-text-primary">Desglose por categorías</h2>
          {summary.byCategory.map(({ category, total, percentage }) => (
            <div
              key={category.id}
              className="flex flex-col gap-2 rounded-card bg-bg-card p-4 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-sm"
                    style={{ backgroundColor: category.color + '33' }}
                  >
                    {category.icon}
                  </span>
                  <span
                    className="rounded px-2 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-medium text-text-primary">{formatEur(total)}</span>
                  <span className="ml-2 text-sm text-text-secondary">{percentage.toFixed(1)}%</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 overflow-hidden rounded-full bg-bg-input">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: category.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
