import type { Expense } from '../../../domain/budget/model/types'
import type { Category } from '../../../domain/budget/model/types'

type ExpenseRowProps = {
  expense: Expense
  category: Category | undefined
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function ExpenseRow({ expense, category, onEdit, onDelete }: ExpenseRowProps) {
  return (
    <div className="flex items-center justify-between rounded-card bg-bg-card p-4 shadow-card">
      <div className="flex flex-col gap-1">
        <p className="font-medium text-text-primary">{expense.description}</p>
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
      <div className="flex items-center gap-4">
        <span className="font-semibold text-text-primary">{formatAmount(expense.amount)}</span>
        <div className="flex gap-2">
          <button
            aria-label="Editar"
            onClick={() => onEdit(expense)}
            className="rounded-md px-3 py-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Editar
          </button>
          <button
            aria-label="Eliminar"
            onClick={() => onDelete(expense.id)}
            className="rounded-md px-3 py-1.5 text-sm text-danger transition-colors hover:opacity-80"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
