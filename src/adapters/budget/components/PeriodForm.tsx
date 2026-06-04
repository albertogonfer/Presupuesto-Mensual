import { useState } from 'react'
import { Input } from '../../shared/components/Input'
import { Button } from '../../shared/components/Button'
import type { BudgetPeriod } from '../../../domain/budget/model/types'

const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
]

type PeriodFormValues = {
  month: number
  year: number
  netSalary: number
  savingsGoal?: number
}

type PeriodFormProps = {
  onSubmit: (values: PeriodFormValues) => void
  onCancel: () => void
  initialValues?: Pick<BudgetPeriod, 'month' | 'year' | 'netSalary' | 'savingsGoal'>
  editMode?: boolean
  prefillHint?: boolean
}

export function PeriodForm({ onSubmit, onCancel, initialValues, editMode = false, prefillHint = false }: PeriodFormProps) {
  const now = new Date()
  const [month, setMonth] = useState(initialValues?.month ?? now.getMonth() + 1)
  const [year, setYear] = useState(initialValues?.year ?? now.getFullYear())
  const [netSalary, setNetSalary] = useState(initialValues?.netSalary?.toString() ?? '')
  const [hasSavingsGoal, setHasSavingsGoal] = useState(initialValues?.savingsGoal !== undefined)
  const [savingsGoal, setSavingsGoal] = useState(initialValues?.savingsGoal?.toString() ?? '')
  const [salaryEdited, setSalaryEdited] = useState(false)

  const showHint = prefillHint && !salaryEdited && netSalary !== ''

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      month,
      year: Number(year),
      netSalary: Number(netSalary),
      savingsGoal: hasSavingsGoal && savingsGoal !== '' ? Number(savingsGoal) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="period-month" className="text-sm font-medium text-text-secondary">
          Mes
        </label>
        <select
          id="period-month"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          disabled={editMode}
          className="rounded-md bg-bg-input px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <Input
        id="period-year"
        label="Año"
        type="number"
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        min={2020}
        max={2100}
        required
        disabled={editMode}
      />

      <Input
        id="period-salary"
        label="Sueldo neto"
        type="number"
        value={netSalary}
        onChange={(e) => { setNetSalary(e.target.value); setSalaryEdited(true) }}
        placeholder="Ej: 2.500"
        min={1}
        required
      />
      {showHint && (
        <p className="text-xs text-text-secondary">Igual que el período anterior. Puedes modificarlo.</p>
      )}

      <div className="flex flex-col gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-text-secondary">
          <input
            type="checkbox"
            checked={hasSavingsGoal}
            onChange={(e) => {
              setHasSavingsGoal(e.target.checked)
              if (!e.target.checked) setSavingsGoal('')
            }}
            className="h-4 w-4 rounded accent-accent"
          />
          Establecer objetivo de ahorro
        </label>
        {hasSavingsGoal && (
          <Input
            id="period-savings-goal"
            label="Objetivo de ahorro"
            type="number"
            value={savingsGoal}
            onChange={(e) => setSavingsGoal(e.target.value)}
            placeholder="Ej: 500"
            min={0}
            required
          />
        )}
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
