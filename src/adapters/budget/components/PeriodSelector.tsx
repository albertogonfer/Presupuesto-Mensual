import type { BudgetPeriod } from '../../../domain/budget/model/types'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

type PeriodSelectorProps = {
  periods: BudgetPeriod[]
  activePeriodId: string | null
  onSelect: (id: string) => void
}

export function PeriodSelector({ periods, activePeriodId, onSelect }: PeriodSelectorProps) {
  if (periods.length === 0) return null

  const sorted = [...periods].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month,
  )

  const activeIndex = sorted.findIndex((p) => p.id === activePeriodId)
  const active = activeIndex !== -1 ? sorted[activeIndex] : sorted[sorted.length - 1]
  const idx = activeIndex !== -1 ? activeIndex : sorted.length - 1

  const hasPrev = idx > 0
  const hasNext = idx < sorted.length - 1

  const label = `${MONTH_NAMES[active.month - 1]} ${active.year}`

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => hasPrev && onSelect(sorted[idx - 1].id)}
        disabled={!hasPrev}
        aria-label="Período anterior"
        className="rounded p-1 text-text-secondary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
      >
        ‹
      </button>
      <span className="min-w-[120px] text-center text-sm font-medium text-text-primary">
        {label}
      </span>
      <button
        type="button"
        onClick={() => hasNext && onSelect(sorted[idx + 1].id)}
        disabled={!hasNext}
        aria-label="Período siguiente"
        className="rounded p-1 text-text-secondary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
      >
        ›
      </button>
    </div>
  )
}
