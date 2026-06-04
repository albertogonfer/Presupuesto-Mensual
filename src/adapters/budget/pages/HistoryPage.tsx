import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePeriodsStore } from '../store/periodsStore'
import { useExpensesStore } from '../store/expensesStore'
import { EmptyState } from '../../shared/components/EmptyState'
import { MonthlyComparisonChart } from '../components/MonthlyComparisonChart'
import { buildComparisonData } from '../../../domain/budget/services/buildComparisonData'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import { PageSpinner } from '../../shared/components/PageSpinner'
import { StoreError } from '../../shared/components/StoreError'

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

export default function HistoryPage() {
  const navigate = useNavigate()
  const periods = usePeriodsStore((s) => s.periods)
  const setActivePeriod = usePeriodsStore((s) => s.setActivePeriod)
  const deletePeriod = usePeriodsStore((s) => s.deletePeriod)
  const allExpenses = useExpensesStore((s) => s.expenses)
  const periodsLoading = usePeriodsStore((s) => s.loading)
  const periodsError = usePeriodsStore((s) => s.error)
  const expensesLoading = useExpensesStore((s) => s.loading)
  const expensesError = useExpensesStore((s) => s.error)
  const fetchPeriods = usePeriodsStore((s) => s.fetchAll)
  const fetchExpenses = useExpensesStore((s) => s.fetchAll)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const loading = periodsLoading || expensesLoading
  const error = periodsError || expensesError

  if (loading) return <PageSpinner />
  if (error) return <StoreError onRetry={() => { fetchPeriods(); fetchExpenses() }} />

  const sorted = [...periods].sort((a, b) =>
    a.year !== b.year ? b.year - a.year : b.month - a.month,
  )

  const comparisonData = buildComparisonData(periods, allExpenses)
  const chartSlice = comparisonData.slice(-6)

  function handleSelectPeriod(id: string) {
    setActivePeriod(id)
    navigate('/')
  }

  function handleDeleteConfirm() {
    if (confirmId) {
      deletePeriod(confirmId)
      setConfirmId(null)
    }
  }

  const confirmPeriod = periods.find((p) => p.id === confirmId)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-text-primary">Historial de períodos</h1>

      {sorted.length === 0 ? (
        <EmptyState
          message="No hay períodos registrados aún."
          actionLabel="Ir a Configuración"
          onAction={() => navigate('/settings')}
        />
      ) : (
        <>
          {comparisonData.length >= 2 && (
            <section aria-label="Comparación mensual" className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-text-primary">Comparación mensual</h2>

              <div className="rounded-card bg-bg-card p-4 shadow-card">
                <MonthlyComparisonChart data={chartSlice} />
              </div>

              <div className="overflow-x-auto rounded-card bg-bg-card shadow-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-bg-input text-left text-text-secondary">
                      <th className="p-4 font-medium">Período</th>
                      <th className="p-4 font-medium">Gastado</th>
                      <th className="p-4 font-medium">vs mes anterior</th>
                      <th className="p-4 font-medium">% usado</th>
                      <th className="p-4 font-medium">Ahorro real</th>
                      <th className="p-4 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...chartSlice].reverse().map((row) => {
                      const vsSign = row.vsLastMonth !== undefined
                        ? row.vsLastMonth > 0 ? 'up' : row.vsLastMonth < 0 ? 'down' : 'neutral'
                        : null

                      return (
                        <tr
                          key={row.periodId}
                          className="border-b border-bg-input/50 last:border-0"
                        >
                          <td className="p-4 font-medium text-text-primary">{row.label}</td>
                          <td className="p-4 text-text-secondary">{formatEur(row.totalSpent)}</td>
                          <td className="p-4">
                            {vsSign === null || row.vsLastMonth === undefined ? (
                              <span className="text-text-secondary">—</span>
                            ) : vsSign === 'up' ? (
                              <span className="font-medium text-danger">
                                ↑ {formatEur(row.vsLastMonth)}
                              </span>
                            ) : vsSign === 'down' ? (
                              <span className="font-medium text-success">
                                ↓ {formatEur(Math.abs(row.vsLastMonth))}
                              </span>
                            ) : (
                              <span className="text-text-secondary">= {formatEur(0)}</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span
                              className={`rounded px-2 py-0.5 text-xs font-medium ${
                                row.percentUsed > 100
                                  ? 'bg-danger/20 text-danger'
                                  : row.percentUsed > 80
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-success/20 text-success'
                              }`}
                            >
                              {row.percentUsed.toFixed(1)} %
                            </span>
                          </td>
                          <td className={`p-4 font-medium ${row.remaining < 0 ? 'text-danger' : 'text-success'}`}>
                            {formatEur(row.remaining)}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/history/${row.periodId}/summary`) }}
                              className="rounded border border-bg-input px-3 py-1 text-xs text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
                            >
                              Ver resumen
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <div className="h-px bg-bg-input" />

          <div className="overflow-x-auto rounded-card bg-bg-card shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-input text-left text-text-secondary">
                  <th className="p-4 font-medium">Período</th>
                  <th className="p-4 font-medium">Sueldo neto</th>
                  <th className="p-4 font-medium">Total gastado</th>
                  <th className="p-4 font-medium">Restante</th>
                  <th className="p-4 font-medium">% usado</th>
                  <th className="p-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((period) => {
                  const expenses = allExpenses.filter((e) => e.periodId === period.id)
                  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
                  const remaining = period.netSalary - totalSpent
                  const percentUsed = period.netSalary > 0
                    ? (totalSpent / period.netSalary) * 100
                    : 0
                  const isOver = remaining < 0

                  return (
                    <tr
                      key={period.id}
                      role="row"
                      onClick={() => handleSelectPeriod(period.id)}
                      className="cursor-pointer border-b border-bg-input/50 transition-colors last:border-0 hover:bg-bg-input/30"
                    >
                      <td className="p-4 font-medium text-text-primary">
                        {MONTH_NAMES[period.month - 1]} {period.year}
                      </td>
                      <td className="p-4 text-text-secondary">
                        {formatEur(period.netSalary)}
                      </td>
                      <td className="p-4 text-text-secondary">
                        {formatEur(totalSpent)}
                      </td>
                      <td className={`p-4 font-medium ${isOver ? 'text-danger' : 'text-success'}`}>
                        {formatEur(remaining)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                            percentUsed > 100
                              ? 'bg-danger/20 text-danger'
                              : percentUsed > 80
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-success/20 text-success'
                          }`}
                        >
                          {percentUsed.toFixed(1)} %
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmId(period.id) }}
                          className="rounded border border-danger/40 px-3 py-1 text-xs text-danger hover:bg-danger/10 transition-colors"
                          aria-label={`Eliminar período ${MONTH_NAMES[period.month - 1]} ${period.year}`}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      <ConfirmDialog
        open={confirmId !== null}
        title="Eliminar período"
        message={
          confirmPeriod
            ? `¿Seguro que quieres eliminar ${MONTH_NAMES[confirmPeriod.month - 1]} ${confirmPeriod.year}? Se borrarán también todos sus gastos. Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}
