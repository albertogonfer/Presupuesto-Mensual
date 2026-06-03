import { useState } from 'react'
import { Input } from '../../shared/components/Input'
import { Button } from '../../shared/components/Button'

const PRESET_COLORS = [
  '#6366F1', // indigo
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // rose
  '#8B5CF6', // violet
  '#0EA5E9', // sky
  '#F97316', // orange
  '#14B8A6', // teal
]

type CategoryFormValues = {
  name: string
  color: string
  icon: string
}

type CategoryFormProps = {
  onSubmit: (values: CategoryFormValues) => void
  onCancel: () => void
  initialValues?: CategoryFormValues
}

export function CategoryForm({ onSubmit, onCancel, initialValues }: CategoryFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [icon, setIcon] = useState(initialValues?.icon ?? '📦')
  const [color, setColor] = useState(initialValues?.color ?? PRESET_COLORS[0])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ name: name.trim(), icon: icon.trim(), color })
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
      <Input
        id="category-icon"
        label="Ícono"
        value={icon}
        onChange={(e) => setIcon(e.target.value)}
        placeholder="Emoji"
        maxLength={4}
        required
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
              className="h-7 w-7 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                outline: c === color ? '2px solid white' : 'none',
                outlineOffset: '2px',
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
