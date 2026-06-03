import { useState } from 'react'
import type { Expense, Category } from '../../../domain/budget/model/types'
import { Input } from '../../shared/components/Input'
import { Button } from '../../shared/components/Button'

type ExpenseFormProps = {
  categories: Category[]
  onSubmit: (values: { description: string; amount: number; categoryId: string; date: string }) => void
  onCancel: () => void
  initialValues?: Pick<Expense, 'description' | 'amount' | 'categoryId' | 'date'>
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function ExpenseForm({ categories, onSubmit, onCancel, initialValues }: ExpenseFormProps) {
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [amount, setAmount] = useState(
    initialValues?.amount !== undefined ? String(initialValues.amount) : '',
  )
  const [categoryId, setCategoryId] = useState(
    initialValues?.categoryId ?? (categories[0]?.id ?? ''),
  )
  const [date, setDate] = useState(initialValues?.date ?? todayISO())
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = parseFloat(amount.replace(',', '.'))
    if (!description.trim()) {
      setError('La descripción es obligatoria.')
      return
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('El importe debe ser mayor que 0.')
      return
    }
    if (!categoryId) {
      setError('Selecciona una categoría.')
      return
    }
    setError(null)
    onSubmit({ description: description.trim(), amount: parsedAmount, categoryId, date })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="expense-description"
        label="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Introduce la descripción"
        required
      />
      <Input
        id="expense-amount"
        label="Importe (€)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0,00"
        inputMode="decimal"
      />
      <div className="flex flex-col gap-1">
        <label htmlFor="expense-category" className="text-sm font-medium text-text-secondary">
          Categoría
        </label>
        <select
          id="expense-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-md bg-bg-input px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>
      <Input
        id="expense-date"
        label="Fecha"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  )
}
