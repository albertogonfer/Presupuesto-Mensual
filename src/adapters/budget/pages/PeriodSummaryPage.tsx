import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePeriodsStore } from '../store/periodsStore'
import { useExpensesStore } from '../store/expensesStore'
import { useCategoriesStore } from '../store/categoriesStore'
import { buildPeriodSummary } from '../../../domain/budget/services/buildPeriodSummary'
import type { DayBreakdown } from '../../../domain/budget/services/buildPeriodSummary'
import type { Category } from '../../../domain/budget/model/types'

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

function CategoryBadge({ category }: { category: Category | undefined }) {
  if (!category) return null
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: category.color + '33', color: category.color }}
    >
      {category.icon} {category.name}
    </span>
  )
}

function DayAccordionRow({
  day,
  categories,
}: {
  day: DayBreakdown
  categories: Category[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-bg-input/50 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-bg-input/30 transition-colors"
        aria-label={`${day.dayLabel} · ${formatEur(day.total)}`}
      >
        <span className="font-medium text-text-primary">{day.dayLabel}</span>
        <span className="flex items-center gap-2 text-text-secondary">
          <span>{formatEur(day.total)}</span>
          <span className="text-xs">{open ? '▲' : '▼'}</span>
        </span>
      </button>

      {open && (
        <ul className="pb-2">
          {day.expenses.map((expense) => {
            const category = categories.find((c) => c.id === expense.categoryId)
            return (
              <li key={expense.id} className="flex items-center justify-between px-6 py-1.5">
                <div className="flex items-center gap-2">
                  <CategoryBadge category={category} />
                  <span className="text-sm text-text-secondary">{expense.description}</span>
                </div>
                <span className="text-sm font-medium text-danger">−{formatEur(expense.amount)}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default function PeriodSummaryPage() {
  const { periodId } = useParams<{ periodId: string }>()
  const navigate = useNavigate()

  const periods = usePeriodsStore((s) => s.periods)
  const allExpenses = useExpensesStore((s) => s.expenses)
  const categories = useCategoriesStore((s) => s.categories)

  const period = periods.find((p) => p.id === periodId)

  if (!period) {
    navigate('/history', { replace: true })
    return null
  }

  const summary = buildPeriodSummary(period, allExpenses, categories, periods, allExpenses)

  // Determine if this is the current/latest period
  const sorted = [...periods].sort((a, b) =>
    a.year !== b.year ? b.year - a.year : b.month - a.month,
  )
  const isLatestPeriod = sorted[0]?.id === period.id

  const periodTitle = `${MONTH_NAMES[period.month - 1]} ${period.year}`

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/history"
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          ← Volver al historial
        </Link>
        <h1 className="text-xl font-semibold text-text-primary">
          Resumen · {periodTitle}
        </h1>
      </div>

      {/* In-progress notice */}
      {isLatestPeriod && (
        <div className="rounded-card bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400 border border-yellow-500/20">
          Este período aún está en curso. Los datos mostrados pueden cambiar.
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-card bg-bg-card p-4 shadow-card text-center">
          <p className="text-xs text-text-secondary mb-1">Total gastado</p>
          <p className="text-lg font-semibold text-text-primary">{formatEur(summary.totalSpent)}</p>
        </div>
        <div className="rounded-card bg-bg-card p-4 shadow-card text-center">
          <p className="text-xs text-text-secondary mb-1">Restante</p>
          <p className={`text-lg font-semibold ${summary.remaining < 0 ? 'text-danger' : 'text-success'}`}>
            {formatEur(summary.remaining)}
          </p>
        </div>
        <div className="rounded-card bg-bg-card p-4 shadow-card text-center">
          <p className="text-xs text-text-secondary mb-1">% usado</p>
          <p
            className={`text-lg font-semibold ${
              summary.percentUsed > 100
                ? 'text-danger'
                : summary.percentUsed > 80
                  ? 'text-yellow-400'
                  : 'text-success'
            }`}
          >
            {summary.percentUsed.toFixed(1)} %
          </p>
        </div>
      </div>

      {/* vs Last Month */}
      {summary.vsLastMonth && (
        <div className="rounded-card bg-bg-card p-4 shadow-card">
          <h2 className="text-sm font-semibold text-text-secondary mb-3">
            vs {summary.vsLastMonth.label}
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-text-secondary mb-0.5">Gastado</p>
              <p className="text-sm font-medium text-text-primary">{formatEur(summary.vsLastMonth.totalSpent)}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-0.5">Restante</p>
              <p className={`text-sm font-medium ${summary.vsLastMonth.remaining < 0 ? 'text-danger' : 'text-success'}`}>
                {formatEur(summary.vsLastMonth.remaining)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-0.5">% usado</p>
              <p className="text-sm font-medium text-text-primary">
                {summary.vsLastMonth.percentUsed.toFixed(1)} %
              </p>
            </div>
          </div>
          {/* Diff arrows */}
          <div className="mt-3 pt-3 border-t border-bg-input text-center text-sm">
            {summary.totalSpent > summary.vsLastMonth.totalSpent ? (
              <span className="text-danger font-medium">
                ↑ {formatEur(summary.totalSpent - summary.vsLastMonth.totalSpent)} más que {summary.vsLastMonth.label}
              </span>
            ) : summary.totalSpent < summary.vsLastMonth.totalSpent ? (
              <span className="text-success font-medium">
                ↓ {formatEur(summary.vsLastMonth.totalSpent - summary.totalSpent)} menos que {summary.vsLastMonth.label}
              </span>
            ) : (
              <span className="text-text-secondary">Igual gasto que {summary.vsLastMonth.label}</span>
            )}
          </div>
        </div>
      )}

      {/* Highlights */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-text-primary border-b border-bg-input pb-2">
          Highlights
        </h2>

        {/* Top spending days */}
        {summary.topSpendingDays.length > 0 && (
          <div className="rounded-card bg-bg-card p-4 shadow-card">
            <p className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
              Días con más gasto
            </p>
            <ul className="flex flex-col gap-1.5">
              {summary.topSpendingDays.map((day) => (
                <li key={day.date} className="flex justify-between text-sm">
                  <span className="text-text-primary">{day.dayLabel}</span>
                  <span className="text-text-secondary font-medium">{formatEur(day.total)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Biggest unexpected */}
        {summary.biggestUnexpected && (
          <div className="rounded-card bg-bg-card p-4 shadow-card">
            <p className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
              Gasto inesperado más alto
            </p>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-text-primary">
                  {summary.biggestUnexpected.description}
                </span>
                <CategoryBadge
                  category={categories.find((c) => c.id === summary.biggestUnexpected!.categoryId)}
                />
              </div>
              <span className="text-sm font-semibold text-danger">
                {formatEur(summary.biggestUnexpected.amount)}
              </span>
            </div>
          </div>
        )}

        {/* Most expensive category */}
        {summary.mostExpensiveCategory && (
          <div className="rounded-card bg-bg-card p-4 shadow-card">
            <p className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
              Categoría más cara
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">
                {summary.mostExpensiveCategory.category.icon} {summary.mostExpensiveCategory.category.name}
              </span>
              <span className="text-sm font-semibold text-text-primary">
                {formatEur(summary.mostExpensiveCategory.total)}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Daily breakdown accordion */}
      {summary.dailyBreakdown.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-text-primary border-b border-bg-input pb-2">
            Desglose diario
          </h2>
          <div className="rounded-card bg-bg-card shadow-card overflow-hidden">
            {summary.dailyBreakdown.map((day) => (
              <DayAccordionRow key={day.date} day={day} categories={categories} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
