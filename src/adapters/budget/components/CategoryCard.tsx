import type { Category } from '../../../domain/budget/model/types'

type CategoryCardProps = {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div className="flex items-center justify-between rounded-card bg-bg-card p-4 shadow-card">
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
          style={{ backgroundColor: category.color + '33' }}
        >
          {category.icon}
        </span>
        <div>
          <p className="font-medium text-text-primary">{category.name}</p>
          <span
            className="mt-0.5 inline-block h-2 w-8 rounded-full"
            style={{ backgroundColor: category.color }}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          aria-label="Editar"
          onClick={() => onEdit(category)}
          className="rounded-md px-3 py-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          Editar
        </button>
        <button
          aria-label="Eliminar"
          onClick={() => onDelete(category.id)}
          className="rounded-md px-3 py-1.5 text-sm text-danger transition-colors hover:opacity-80"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}
