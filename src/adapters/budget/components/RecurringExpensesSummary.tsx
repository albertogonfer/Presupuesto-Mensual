import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRecurringExpensesStore } from '../store/recurringExpensesStore'
import { useCategories } from '../hooks/useCategories'
import { usePeriodsStore } from '../store/periodsStore'
import { getRemainingLabel } from '../../../domain/budget/services/recurringExpenseService'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
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
  const cancelRecurringExpense = useRecurringExpensesStore((s) => s.cancelRecurringExpense)
  const { categories } = useCategories()
  const activePeriodId = usePeriodsStore((s) => s.activePeriodId)
  const periods = usePeriodsStore((s) => s.periods)
  const activePeriod = periods.find((p) => p.id === activePeriodId) ?? null

  const currentMonth = activePeriod?.month ?? new Date().getMonth() + 1
  const currentYear = activePeriod?.year ?? new Date().getFullYear()

  const activeRecurring = recurringExpenses.filter((r) => r.active)

  const [confirmCancel, setConfirmCancel] = useState<{ id: string; description: string } | null>(null)

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
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {activeRecurring.map((r) => {
            const category = categories.find((c) => c.id === r.categoryId)
            const remainingLabel = getRemainingLabel(r, currentMonth, currentYear)
            return (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-bg-card p-4 shadow-card"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    {category && (
                      <span
                        className="rounded px-2 py-0.5 text-xs font-medium text-white shrink-0"
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
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-danger">-{formatEur(r.amount)}</p>
                    <p className="text-xs text-text-secondary">
                      {remainingLabel ?? 'Sin vencimiento'}
                    </p>
                  </div>
                  <button
                    aria-label={`Cancelar ${r.description}`}
                    onClick={() => setConfirmCancel({ id: r.id, description: r.description })}
                    className="text-text-secondary transition-colors hover:text-danger"
                    title="Cancelar gasto recurrente"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={confirmCancel !== null}
        title="¿Cancelar gasto recurrente?"
        message={
          confirmCancel
            ? `Se cancelará «${confirmCancel.description}». No se generarán más gastos automáticos, pero los existentes no se eliminarán.`
            : ''
        }
        onConfirm={() => {
          if (confirmCancel) cancelRecurringExpense(confirmCancel.id)
          setConfirmCancel(null)
        }}
        onCancel={() => setConfirmCancel(null)}
      />
    </div>
  )
}
