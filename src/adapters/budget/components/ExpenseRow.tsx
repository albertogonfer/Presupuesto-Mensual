import type { Expense } from '../../../domain/budget/model/types'
import type { Category } from '../../../domain/budget/model/types'

type ExpenseRowProps = {
  expense: Expense
  category: Category | undefined
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  alternate?: boolean
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function ExpenseRow({ expense, category, onEdit, onDelete, alternate }: ExpenseRowProps) {
  return (
    <div
      className={`flex items-center justify-between border-b border-bg-input/60 p-4 transition-colors last:border-0 hover:bg-bg-input/30 ${
        alternate ? 'bg-bg-input/10' : ''
      }`}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <p className="truncate font-medium text-text-primary">{expense.description}</p>
        <div className="flex items-center gap-2">
          {category && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: category.color + '33', color: category.color }}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </span>
          )}
          <span className="text-xs text-text-secondary">{expense.date}</span>
        </div>
      </div>
      <div className="ml-4 flex shrink-0 items-center gap-4">
        <span className="font-semibold text-text-primary">{formatAmount(expense.amount)}</span>
        <div className="flex gap-1">
          <button
            aria-label={`Editar ${expense.description}`}
            onClick={() => onEdit(expense)}
            className="rounded-md px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-bg-input hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Editar
          </button>
          <button
            aria-label={`Eliminar ${expense.description}`}
            onClick={() => onDelete(expense.id)}
            className="rounded-md px-3 py-1.5 text-sm text-danger transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
