import { useState } from 'react'
import type { Expense, Category } from '../../../domain/budget/model/types'
import { Input } from '../../shared/components/Input'
import { Button } from '../../shared/components/Button'

export type RecurringOptions = {
  frequency: 'weekly' | 'monthly' | 'yearly'
  every: number
  endsAt?: string
  finalPaymentAmount?: number
}

export type ExpenseFormValues = {
  description: string
  amount: number
  categoryId: string
  date: string
  recurring?: RecurringOptions
}

type ExpenseFormProps = {
  categories: Category[]
  onSubmit: (values: ExpenseFormValues) => void
  onCancel: () => void
  initialValues?: Pick<Expense, 'description' | 'amount' | 'categoryId' | 'date'>
}

const FREQUENCIES: Array<{ value: RecurringOptions['frequency']; label: string; everyUnit: string }> = [
  { value: 'weekly', label: 'Semanal', everyUnit: 'semanas' },
  { value: 'monthly', label: 'Mensual', everyUnit: 'meses' },
  { value: 'yearly', label: 'Anual', everyUnit: 'años' },
]

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function Toggle({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-3">
      <span className="text-sm font-medium text-text-secondary">{label}</span>
      <span className="relative inline-flex">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full border border-border bg-bg-input transition-colors peer-checked:border-accent peer-checked:bg-accent peer-checked:shadow-[0_0_12px_rgba(99,102,241,0.5)] peer-focus-visible:ring-2 peer-focus-visible:ring-accent" />
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? 'left-[1.375rem]' : 'left-0.5'}`} />
      </span>
    </label>
  )
}

export function ExpenseForm({ categories, onSubmit, onCancel, initialValues }: ExpenseFormProps) {
  const isEditing = initialValues !== undefined
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [amount, setAmount] = useState(
    initialValues?.amount !== undefined ? String(initialValues.amount) : '',
  )
  const [categoryId, setCategoryId] = useState(
    initialValues?.categoryId ?? (categories[0]?.id ?? ''),
  )
  const [date, setDate] = useState(initialValues?.date ?? todayISO())
  const [error, setError] = useState<string | null>(null)

  // Recurring expense options (Negro Puro v3 modal) — only when adding
  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState<RecurringOptions['frequency']>('monthly')
  const [every, setEvery] = useState('1')
  const [hasEndDate, setHasEndDate] = useState(false)
  const [endsAt, setEndsAt] = useState('')
  const [hasFinalPayment, setHasFinalPayment] = useState(false)
  const [finalPayment, setFinalPayment] = useState('')

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

    let recurring: RecurringOptions | undefined
    if (!isEditing && isRecurring) {
      const parsedEvery = parseInt(every, 10)
      if (isNaN(parsedEvery) || parsedEvery < 1) {
        setError('La repetición debe ser cada 1 o más.')
        return
      }
      if (hasEndDate && !endsAt) {
        setError('Indica la fecha de fin de la recurrencia.')
        return
      }
      const parsedFinal = hasFinalPayment ? parseFloat(finalPayment.replace(',', '.')) : undefined
      if (hasFinalPayment && (parsedFinal === undefined || isNaN(parsedFinal) || parsedFinal <= 0)) {
        setError('La cuota final debe ser mayor que 0.')
        return
      }
      recurring = {
        frequency,
        every: parsedEvery,
        endsAt: hasEndDate ? endsAt : undefined,
        finalPaymentAmount: hasFinalPayment ? parsedFinal : undefined,
      }
    }

    setError(null)
    onSubmit({ description: description.trim(), amount: parsedAmount, categoryId, date, recurring })
  }

  const everyUnit = FREQUENCIES.find((f) => f.value === frequency)?.everyUnit ?? 'meses'

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
          className="min-h-11 rounded-lg border border-border bg-bg-input px-3 py-2 text-base text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 sm:min-h-9 sm:text-sm"
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

      {!isEditing && (
        <div className="flex flex-col gap-4 rounded-card border border-border bg-bg-primary/40 p-4">
          <Toggle id="expense-recurring" checked={isRecurring} onChange={setIsRecurring} label="Gasto recurrente" />

          {isRecurring && (
            <>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-text-secondary">Frecuencia</span>
                <div role="radiogroup" aria-label="Frecuencia" className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-bg-input p-1">
                  {FREQUENCIES.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      role="radio"
                      aria-checked={frequency === f.value}
                      onClick={() => setFrequency(f.value)}
                      className={`rounded-md px-2 py-1.5 text-sm font-medium transition-all ${
                        frequency === f.value
                          ? 'bg-accent text-white shadow-[0_0_12px_rgba(99,102,241,0.45)]'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="expense-every" className="text-sm font-medium text-text-secondary">
                  Cada
                </label>
                <input
                  id="expense-every"
                  type="number"
                  min={1}
                  value={every}
                  onChange={(e) => setEvery(e.target.value)}
                  className="w-20 rounded-lg border border-border bg-bg-input px-3 py-1.5 text-center text-base text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 sm:text-sm"
                />
                <span className="text-sm text-text-secondary">{everyUnit}</span>
              </div>

              <Toggle id="expense-has-end" checked={hasEndDate} onChange={setHasEndDate} label="Fecha de fin" />
              {hasEndDate && (
                <Input
                  id="expense-ends-at"
                  aria-label="Fecha de fin de la recurrencia"
                  type="date"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
              )}

              <Toggle id="expense-has-final" checked={hasFinalPayment} onChange={setHasFinalPayment} label="Cuota final distinta" />
              {hasFinalPayment && (
                <Input
                  id="expense-final-payment"
                  aria-label="Importe de la cuota final"
                  value={finalPayment}
                  onChange={(e) => setFinalPayment(e.target.value)}
                  placeholder="0,00"
                  inputMode="decimal"
                />
              )}
            </>
          )}
        </div>
      )}

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
