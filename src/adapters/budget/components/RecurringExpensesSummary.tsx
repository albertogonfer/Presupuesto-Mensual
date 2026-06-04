import { Link } from 'react-router-dom'
import { useRecurringExpensesStore } from '../store/recurringExpensesStore'
import { useCategories } from '../hooks/useCategories'
import { usePeriodsStore } from '../store/periodsStore'
import { getRemainingLabel } from '../../../domain/budget/services/recurringExpenseService'
import type { RecurringExpense } from '../../../domain/budget/model/types'

const FREQUENCY_LABELS: Record<RecurringExpense['frequency'], string> = {
  daily: 'Diaria',
  weekly: 'Semanal',
  monthly: 'Mensual',
  yearly: 'Anual',
}

function formatEur(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function RecurringExpensesSummary() {
  const recurringExpenses = useRecurringExpensesStore((s) => s.recurringExpenses)
  const { categories } = useCategories()
  const activePeriodId = usePeriodsStore((s) => s.activePeriodId)
  const periods = usePeriodsStore((s) => s.periods)
  const activePeriod = periods.find((p) => p.id === activePeriodId) ?? null

  const currentMonth = activePeriod?.month ?? new Date().getMonth() + 1
  const currentYear = activePeriod?.year ?? new Date().getFullYear()

  const activeRecurring = recurringExpenses.filter((r) => r.active)

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-text-primary">Gastos recurrentes activos</h2>
      {activeRecurring.length === 0 ? (
        <p className="text-sm text-text-secondary">
          No hay gastos recurrentes activos.{' '}
          <Link to="/recurring" className="text-accent underline">
            Añade uno en la sección Recurrentes.
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {activeRecurring.map((r) => {
            const category = categories.find((c) => c.id === r.categoryId)
            const remainingLabel = getRemainingLabel(r, currentMonth, currentYear)
            return (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-card bg-bg-card p-4 shadow-card"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    {category && (
                      <span
                        className="rounded px-2 py-0.5 text-xs font-medium text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.icon}
                      </span>
                    )}
                    <span className="text-sm font-medium text-text-primary">{r.description}</span>
                  </div>
                  <span className="text-xs text-text-secondary">
                    {FREQUENCY_LABELS[r.frequency]}
                    {r.every > 1 ? ` · cada ${r.every}` : ''}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-text-primary">{formatEur(r.amount)}</p>
                  <p className="text-xs text-text-secondary">
                    {remainingLabel ?? 'Sin vencimiento'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
