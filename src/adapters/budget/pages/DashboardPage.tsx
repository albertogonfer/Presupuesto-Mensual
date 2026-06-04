import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePeriodsStore } from '../store/periodsStore'
import { useExpensesStore } from '../store/expensesStore'
import { useExpenses } from '../hooks/useExpenses'
import { useCategories } from '../hooks/useCategories'
import { useBudgetSummary } from '../hooks/useBudgetSummary'
import { SummaryCard } from '../components/SummaryCard'
import { BudgetPieChart } from '../components/BudgetPieChart'
import { BudgetBarChart } from '../components/BudgetBarChart'
import { PeriodSelector } from '../components/PeriodSelector'
import { ExpenseForm } from '../components/ExpenseForm'
import { RecurringExpensesSummary } from '../components/RecurringExpensesSummary'
import { Modal } from '../../shared/components/Modal'
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
  const setActivePeriod = usePeriodsStore((s) => s.setActivePeriod)
  const periods = usePeriodsStore((s) => s.periods)
  const activePeriod = periods.find((p) => p.id === activePeriodId) ?? null
  const summary = useBudgetSummary()
  const allExpenses = useExpensesStore((s) => s.expenses)
  const { addExpense } = useExpenses()
  const { categories } = useCategories()
  const [fabOpen, setFabOpen] = useState(false)
  const navigate = useNavigate()

  if (!activePeriod || !summary) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
        <EmptyState
          message="Configura un período con tu sueldo antes de ver el resumen."
          actionLabel="Ir a Configuración"
          onAction={() => navigate('/settings')}
          icon="⚙️"
        />
      </div>
    )
  }

  const monthName = MONTH_NAMES[activePeriod.month - 1]
  const remainingVariant = summary.remaining >= 0 ? 'success' : 'danger'
  const savingsProgressVariant = (summary.savingsProgress ?? 0) >= 0 ? 'success' : 'danger'
  const savingsProgressPercent = summary.savingsGoal
    ? Math.min((summary.remaining / summary.savingsGoal) * 100, 100)
    : 0

  function handleFabSubmit(values: { description: string; amount: number; categoryId: string; date: string }) {
    addExpense({ ...values, periodId: activePeriodId! })
    setFabOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Two-column layout on wide screens: main content left, recurring widget right */}
      {/* Wrapper that becomes a grid at lg breakpoint */}
      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-6">
      <div className="flex flex-col gap-6">
      {/* Header card */}
      <div className="rounded-card bg-bg-card p-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-text-primary">
            {monthName} {activePeriod.year}
          </h1>
          <PeriodSelector
            periods={periods}
            activePeriodId={activePeriodId}
            onSelect={setActivePeriod}
          />
        </div>
        <p className="mt-1 text-text-secondary">
          Sueldo neto: <span className="font-medium text-text-primary">{formatEur(activePeriod.netSalary)}</span>
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Total gastado" value={formatEur(summary.totalSpent)} icon="💸" />
        <SummaryCard
          label="Dinero restante"
          value={formatEur(summary.remaining)}
          variant={remainingVariant}
          icon={summary.remaining >= 0 ? '✅' : '⚠️'}
        />
        <SummaryCard
          label="Porcentaje utilizado"
          value={`${summary.percentUsed.toFixed(1)} %`}
          variant={summary.percentUsed > 100 ? 'danger' : 'default'}
          icon="📊"
        />
      </div>

      {/* Savings goal card */}
      {summary.savingsGoal !== undefined && (
        <div className="flex flex-col gap-3 rounded-card bg-bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">Objetivo de ahorro</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-input text-base">🎯</span>
          </div>
          <span className="text-2xl font-bold text-text-primary">
            {formatEur(summary.savingsGoal)} objetivo
          </span>
          <p className={`text-sm font-medium ${savingsProgressVariant === 'success' ? 'text-success' : 'text-danger'}`}>
            {(summary.savingsProgress ?? 0) >= 0
              ? `Te quedan ${formatEur(summary.savingsProgress ?? 0)} tras el objetivo`
              : `Faltan ${formatEur(Math.abs(summary.savingsProgress ?? 0))} para alcanzar el objetivo`}
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-bg-input">
            <div
              className={`h-full rounded-full transition-all ${savingsProgressVariant === 'success' ? 'bg-success' : 'bg-danger'}`}
              style={{ width: `${Math.max(savingsProgressPercent, 0)}%` }}
            />
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {summary.byCategory.length === 0 ? (
        <div className="flex items-center justify-between">
          <EmptyState message="Aún no tienes gastos registrados" icon="📋" />
          <button
            aria-label="+ Gasto"
            onClick={() => setFabOpen(true)}
            className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            + Gasto
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Desglose por categorías</h2>
            <button
              aria-label="+ Gasto"
              onClick={() => setFabOpen(true)}
              className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              + Gasto
            </button>
          </div>
          {summary.byCategory.map(({ category, total, percentage }) => {
            const hasLimit = category.limit !== undefined && category.limit > 0
            const limitRatio = hasLimit ? total / category.limit! : null
            const barWidth = hasLimit
              ? Math.min(limitRatio! * 100, 100)
              : Math.min(percentage, 100)
            const isOverLimit = hasLimit && total >= category.limit!
            const isNearLimit = hasLimit && !isOverLimit && limitRatio! >= 0.8
            const barColorClass = isOverLimit
              ? 'bg-danger'
              : isNearLimit
              ? 'bg-yellow-500'
              : ''
            const barStyle = barColorClass === '' ? { backgroundColor: category.color } : {}

            return (
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
                    <div className="flex flex-col">
                      <span
                        className="w-fit rounded px-2 py-0.5 text-xs font-medium text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name}
                      </span>
                      {hasLimit && (
                        <span className="mt-0.5 px-2 text-xs text-text-secondary">
                          {formatEur(total)} / {formatEur(category.limit!)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-text-primary">{formatEur(total)}</span>
                    <span className="ml-2 text-sm text-text-secondary">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-input">
                  <div
                    className={`h-full rounded-full transition-all ${barColorClass}`}
                    style={{ width: `${barWidth}%`, ...barStyle }}
                  />
                </div>
                {isOverLimit && (
                  <span className="text-xs font-medium text-danger">Límite superado</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Charts section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-text-primary">Gráficos</h2>
        <BudgetPieChart summary={summary} />
        <BudgetBarChart periods={periods} expenses={allExpenses} />
      </div>{/* end charts section */}
      </div>{/* end left column */}
      <div className="mt-6 lg:mt-0 lg:sticky lg:top-6">
        <RecurringExpensesSummary />
      </div>
      </div>{/* end two-column grid */}

      <Modal open={fabOpen} title="Nuevo gasto" onClose={() => setFabOpen(false)}>
        <ExpenseForm
          categories={categories}
          onSubmit={handleFabSubmit}
          onCancel={() => setFabOpen(false)}
        />
      </Modal>
    </div>
  )
}
