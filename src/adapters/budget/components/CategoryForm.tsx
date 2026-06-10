import { useState } from 'react'
import { Input } from '../../shared/components/Input'
import { Button } from '../../shared/components/Button'
import { CATEGORY_ICON_OPTIONS } from './categoryIcons'
import { CategoryIcon } from './CategoryIcon'

export const PRESET_COLORS = [
  '#8B5CF6', // violet
  '#0EA5E9', // sky
  '#F59E0B', // amber
  '#F97316', // orange
  '#14B8A6', // teal
  '#EC4899', // pink
  '#64748B', // slate
  '#A16207', // yellow-dark
]

type CategoryFormValues = {
  name: string
  color: string
  icon: string
  limit?: number
}

type CategoryFormProps = {
  onSubmit: (values: CategoryFormValues) => void
  onCancel: () => void
  initialValues?: CategoryFormValues
}

export function CategoryForm({ onSubmit, onCancel, initialValues }: CategoryFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [icon, setIcon] = useState(initialValues?.icon ?? 'package')
  const [color, setColor] = useState(initialValues?.color ?? PRESET_COLORS[0])
  const [limit, setLimit] = useState<string>(
    initialValues?.limit !== undefined ? String(initialValues.limit) : ''
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedLimit = limit.trim() !== '' ? parseFloat(limit) : undefined
    onSubmit({ name: name.trim(), icon: icon.trim(), color, limit: parsedLimit })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="category-name"
        label="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ej: Transporte"
        required
      />
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text-secondary">Ícono</span>
        <div role="radiogroup" aria-label="Ícono" className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
          {CATEGORY_ICON_OPTIONS.map(({ name: iconName, label, Icon }) => (
            <button
              key={iconName}
              type="button"
              role="radio"
              aria-checked={icon === iconName}
              aria-label={label}
              title={label}
              onClick={() => setIcon(iconName)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-all ${
                icon === iconName
                  ? 'border-accent bg-accent/15 text-accent-hover shadow-[0_0_12px_rgba(99,102,241,0.45)]'
                  : 'border-border bg-bg-input text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon aria-hidden className="h-5 w-5" />
            </button>
          ))}
          {/* Legacy emoji icon stays selectable while editing an old category */}
          {initialValues && !CATEGORY_ICON_OPTIONS.some((o) => o.name === initialValues.icon) && (
            <button
              type="button"
              role="radio"
              aria-checked={icon === initialValues.icon}
              aria-label={`Ícono actual ${initialValues.icon}`}
              onClick={() => setIcon(initialValues.icon)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border text-lg transition-all ${
                icon === initialValues.icon
                  ? 'border-accent bg-accent/15 shadow-[0_0_12px_rgba(99,102,241,0.45)]'
                  : 'border-border bg-bg-input'
              }`}
            >
              <CategoryIcon icon={initialValues.icon} />
            </button>
          )}
        </div>
      </div>
      <Input
        id="category-limit"
        label="Límite mensual (€)"
        type="number"
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
        placeholder="Sin límite"
        min={0}
      />
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text-secondary">Color</span>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              onClick={() => setColor(c)}
              className="h-8 w-8 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                outline: c === color ? '2px solid white' : '1px solid rgba(255,255,255,0.15)',
                outlineOffset: '2px',
                boxShadow: c === color ? `0 0 14px ${c}` : 'none',
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  )
}
