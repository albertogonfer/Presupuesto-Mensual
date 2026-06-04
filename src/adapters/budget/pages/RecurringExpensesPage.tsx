import { useState } from 'react'
import { useRecurringExpensesStore } from '../store/recurringExpensesStore'
import { useCategories } from '../hooks/useCategories'
import { usePeriodsStore } from '../store/periodsStore'
import { getRemainingLabel } from '../../../domain/budget/services/recurringExpenseService'
import type { RecurringExpense } from '../../../domain/budget/model/types'
import { Button } from '../../shared/components/Button'
import { Modal } from '../../shared/components/Modal'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import { EmptyState } from '../../shared/components/EmptyState'

const FREQUENCY_LABELS: Record<RecurringExpense['frequency'], string> = {
  daily: 'Diaria',
  weekly: 'Semanal',
  monthly: 'Mensual',
  yearly: 'Anual',
}

type FormValues = {
  description: string
  categoryId: string
  amount: string
  frequency: RecurringExpense['frequency']
  every: string
  expiryType: 'none' | 'date' | 'count'
  endsAt: string
  endsAfter: string
}

const defaultForm: FormValues = {
  description: '',
  categoryId: '',
  amount: '',
  frequency: 'monthly',
  every: '1',
  expiryType: 'none',
  endsAt: '',
  endsAfter: '',
}

function formatEur(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function RecurringExpensesPage() {
  const { recurringExpenses, addRecurringExpense, cancelRecurringExpense } =
    useRecurringExpensesStore()
  const { categories } = useCategories()
  const activePeriodId = usePeriodsStore((s) => s.activePeriodId)
  const periods = usePeriodsStore((s) => s.periods)
  const activePeriod = periods.find((p) => p.id === activePeriodId) ?? null

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormValues>(defaultForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({})
  const [confirmCancel, setConfirmCancel] = useState<{ id: string; description: string } | null>(
    null,
  )

  const activeRecurring = recurringExpenses.filter((r) => r.active)

  const currentMonth = activePeriod?.month ?? new Date().getMonth() + 1
  const currentYear = activePeriod?.year ?? new Date().getFullYear()

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormValues, string>> = {}
    if (!form.description.trim()) newErrors.description = 'La descripción es obligatoria.'
    if (!form.categoryId) newErrors.categoryId = 'Selecciona una categoría.'
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) newErrors.amount = 'El importe debe ser mayor que 0.'
    const every = parseInt(form.every)
    if (isNaN(every) || every < 1) newErrors.every = 'El valor debe ser al menos 1.'
    if (form.expiryType === 'date' && !form.endsAt) newErrors.endsAt = 'Introduce una fecha de vencimiento.'
    if (form.expiryType === 'count') {
      const n = parseInt(form.endsAfter)
      if (isNaN(n) || n < 1) newErrors.endsAfter = 'El número de pagos debe ser al menos 1.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    addRecurringExpense({
      description: form.description.trim(),
      categoryId: form.categoryId,
      amount: parseFloat(form.amount),
      frequency: form.frequency,
      every: parseInt(form.every),
      ...(form.expiryType === 'date' ? { endsAt: form.endsAt } : {}),
      ...(form.expiryType === 'count' ? { endsAfter: parseInt(form.endsAfter) } : {}),
    })
    setForm(defaultForm)
    setErrors({})
    setShowForm(false)
  }

  function handleCancelConfirm() {
    if (!confirmCancel) return
    cancelRecurringExpense(confirmCancel.id)
    setConfirmCancel(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Gastos recurrentes</h1>
        <Button onClick={() => setShowForm(true)}>Nuevo gasto recurrente</Button>
      </div>

      {activeRecurring.length === 0 ? (
        <EmptyState
          message="No tienes gastos recurrentes activos. Añade uno para automatizar tus gastos fijos."
          icon="🔁"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {activeRecurring.map((r) => {
            const category = categories.find((c) => c.id === r.categoryId)
            const remainingLabel = getRemainingLabel(r, currentMonth, currentYear)
            return (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-card bg-bg-card p-4 shadow-card"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {category && (
                      <span
                        className="rounded px-2 py-0.5 text-xs font-medium text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.icon} {category.name}
                      </span>
                    )}
                    <span className="font-medium text-text-primary">{r.description}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <span>{formatEur(r.amount)}</span>
                    <span>·</span>
                    <span>
                      {FREQUENCY_LABELS[r.frequency]}
                      {r.every > 1 ? ` (cada ${r.every})` : ''}
                    </span>
                    {remainingLabel && (
                      <>
                        <span>·</span>
                        <span>{remainingLabel}</span>
                      </>
                    )}
                    {!remainingLabel && (
                      <>
                        <span>·</span>
                        <span>Sin vencimiento</span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="danger"
                  onClick={() => setConfirmCancel({ id: r.id, description: r.description })}
                >
                  Cancelar
                </Button>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={showForm}
        title="Nuevo gasto recurrente"
        onClose={() => {
          setShowForm(false)
          setForm(defaultForm)
          setErrors({})
        }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-primary" htmlFor="rec-description">
              Descripción
            </label>
            <input
              id="rec-description"
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="rounded border border-border bg-bg-input px-3 py-2 text-sm text-text-primary"
              placeholder="Netflix, Seguro moto..."
            />
            {errors.description && (
              <p className="text-xs text-danger">{errors.description}</p>
            )}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-primary" htmlFor="rec-category">
              Categoría
            </label>
            <select
              id="rec-category"
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="rounded border border-border bg-bg-input px-3 py-2 text-sm text-text-primary"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-danger">{errors.categoryId}</p>
            )}
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-primary" htmlFor="rec-amount">
              Importe (€)
            </label>
            <input
              id="rec-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="rounded border border-border bg-bg-input px-3 py-2 text-sm text-text-primary"
              placeholder="0,00"
            />
            {errors.amount && <p className="text-xs text-danger">{errors.amount}</p>}
          </div>

          {/* Frequency + every */}
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-sm font-medium text-text-primary" htmlFor="rec-frequency">
                Frecuencia
              </label>
              <select
                id="rec-frequency"
                value={form.frequency}
                onChange={(e) =>
                  setForm((f) => ({ ...f, frequency: e.target.value as RecurringExpense['frequency'] }))
                }
                className="rounded border border-border bg-bg-input px-3 py-2 text-sm text-text-primary"
              >
                <option value="daily">Diaria</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
            <div className="flex w-24 flex-col gap-1">
              <label className="text-sm font-medium text-text-primary" htmlFor="rec-every">
                Cada
              </label>
              <input
                id="rec-every"
                type="number"
                min="1"
                value={form.every}
                onChange={(e) => setForm((f) => ({ ...f, every: e.target.value }))}
                className="rounded border border-border bg-bg-input px-3 py-2 text-sm text-text-primary"
              />
              {errors.every && <p className="text-xs text-danger">{errors.every}</p>}
            </div>
          </div>

          {/* Expiry type */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text-primary">Vencimiento</span>
            <div className="flex flex-col gap-1.5">
              {(
                [
                  { value: 'none', label: 'Sin vencimiento' },
                  { value: 'date', label: 'En fecha concreta' },
                  { value: 'count', label: 'Tras N pagos' },
                ] as const
              ).map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 text-sm text-text-primary">
                  <input
                    type="radio"
                    name="expiryType"
                    value={value}
                    checked={form.expiryType === value}
                    onChange={() => setForm((f) => ({ ...f, expiryType: value }))}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {form.expiryType === 'date' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-primary" htmlFor="rec-ends-at">
                Fecha de vencimiento
              </label>
              <input
                id="rec-ends-at"
                type="date"
                value={form.endsAt}
                onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                className="rounded border border-border bg-bg-input px-3 py-2 text-sm text-text-primary"
              />
              {errors.endsAt && <p className="text-xs text-danger">{errors.endsAt}</p>}
            </div>
          )}

          {form.expiryType === 'count' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-primary" htmlFor="rec-ends-after">
                Número de pagos
              </label>
              <input
                id="rec-ends-after"
                type="number"
                min="1"
                value={form.endsAfter}
                onChange={(e) => setForm((f) => ({ ...f, endsAfter: e.target.value }))}
                className="rounded border border-border bg-bg-input px-3 py-2 text-sm text-text-primary"
              />
              {errors.endsAfter && (
                <p className="text-xs text-danger">{errors.endsAfter}</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowForm(false)
                setForm(defaultForm)
                setErrors({})
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmCancel !== null}
        title="¿Cancelar gasto recurrente?"
        message={
          confirmCancel
            ? `Se cancelará «${confirmCancel.description}». No se generarán más gastos automáticos, pero los existentes no se eliminarán.`
            : ''
        }
        onConfirm={handleCancelConfirm}
        onCancel={() => setConfirmCancel(null)}
      />
    </div>
  )
}
