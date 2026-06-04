import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRecurringExpensesStore } from '../store/recurringExpensesStore'
import { usePeriodsStore } from '../store/periodsStore'
import { isExpiredForPeriod } from '../../../domain/budget/services/recurringExpenseService'

export function RecurringExpiryBanner() {
  const recurringExpenses = useRecurringExpensesStore((s) => s.recurringExpenses)
  const activePeriodId = usePeriodsStore((s) => s.activePeriodId)
  const periods = usePeriodsStore((s) => s.periods)
  const activePeriod = periods.find((p) => p.id === activePeriodId) ?? null

  const storageKey = activePeriodId ? `dismissed-expiry-${activePeriodId}` : null
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (!storageKey) return false
    try {
      return localStorage.getItem(storageKey) === 'true'
    } catch {
      return false
    }
  })

  if (!activePeriod || dismissed) return null

  const { month, year } = activePeriod
  const expired = recurringExpenses.filter(
    (r) => r.active && r.occurrenceCount > 0 && isExpiredForPeriod(r, month, year),
  )

  if (expired.length === 0) return null

  function handleDismiss() {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, 'true')
      } catch {
        // ignore
      }
    }
    setDismissed(true)
  }

  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-4 rounded-card bg-indigo-50 px-4 py-3 text-sm text-indigo-800 shadow-card dark:bg-indigo-900/30 dark:text-indigo-200"
    >
      <p>
        Los siguientes gastos han finalizado su recurrencia:{' '}
        {expired.map((r, i) => (
          <span key={r.id}>
            {i > 0 && ', '}
            <strong>{r.description}</strong>
          </span>
        ))}
        .{' '}
        <Link to="/recurring" className="underline">
          Puedes cancelarlos desde la sección Recurrentes.
        </Link>
      </p>
      <button
        aria-label="Cerrar aviso"
        onClick={handleDismiss}
        className="shrink-0 text-indigo-600 hover:text-indigo-900 dark:text-indigo-300"
      >
        ✕
      </button>
    </div>
  )
}
