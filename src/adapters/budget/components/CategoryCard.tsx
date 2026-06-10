import type { Category } from '../../../domain/budget/model/types'
import { CategoryIcon } from './CategoryIcon'

type CategoryCardProps = {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-card bg-bg-card p-4 shadow-card transition-shadow hover:shadow-lg">
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl"
          style={{ backgroundColor: category.color + '33', color: category.color }}
        >
          <CategoryIcon icon={category.icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-text-primary">{category.name}</p>
          <span
            className="mt-0.5 inline-block h-2 w-8 rounded-full"
            style={{ backgroundColor: category.color }}
          />
        </div>
      </div>
      <div className="flex gap-2 border-t border-bg-input pt-2">
        <button
          aria-label={`Editar ${category.name}`}
          onClick={() => onEdit(category)}
          className="flex-1 rounded-md px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-bg-input hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Editar
        </button>
        <button
          aria-label={`Eliminar ${category.name}`}
          onClick={() => onDelete(category.id)}
          className="flex-1 rounded-md px-2 py-1 text-xs text-danger transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}
