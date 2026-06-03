import { Button } from '../../shared/components/Button'
import type { BudgetPeriod } from '../../../domain/budget/model/types'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

type PeriodHeaderProps = {
  period: BudgetPeriod
  onEdit: () => void
}

export function PeriodHeader({ period, onEdit }: PeriodHeaderProps) {
  const monthName = MONTH_NAMES[period.month - 1]
  const formattedSalary = period.netSalary.toLocaleString('es-ES')

  return (
    <div className="flex items-center justify-between rounded-card bg-bg-card p-6 shadow-card">
      <div>
        <p className="text-sm text-text-secondary">Período activo</p>
        <h2 className="mt-1 text-xl font-semibold text-text-primary">
          {monthName} {period.year}
        </h2>
        <p className="mt-1 text-text-secondary">
          Sueldo neto:{' '}
          <span className="font-medium text-text-primary">{formattedSalary} €</span>
        </p>
      </div>
      <Button onClick={onEdit} aria-label="Editar período">
        Editar
      </Button>
    </div>
  )
}
