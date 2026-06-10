import { useState } from 'react'
import { usePeriods } from '../hooks/usePeriods'
import { usePeriodsStore } from '../store/periodsStore'
import { useExpensesStore } from '../store/expensesStore'
import { PeriodHeader } from '../components/PeriodHeader'
import { PeriodForm } from '../components/PeriodForm'
import { Modal } from '../../shared/components/Modal'
import { Button } from '../../shared/components/Button'
import { EmptyState } from '../../shared/components/EmptyState'
import { PageSpinner } from '../../shared/components/PageSpinner'
import { StoreError } from '../../shared/components/StoreError'

type ModalMode = 'create' | 'edit' | null

export default function BudgetPeriodPage() {
  const { periods, activePeriod, createPeriod, updatePeriod } = usePeriods()
  const allExpenses = useExpensesStore((s) => s.expenses)
  const loading = usePeriodsStore((s) => s.loading)
  const error = usePeriodsStore((s) => s.error)
  const fetchPeriods = usePeriodsStore((s) => s.fetchAll)
  const [modal, setModal] = useState<ModalMode>(null)
  const [formError, setFormError] = useState<string | null>(null)

  if (loading) return <PageSpinner />
  if (error) return <StoreError onRetry={fetchPeriods} />

  const mostRecentPeriod = periods.length > 0
    ? [...periods].sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month)[0]
    : null

  const prefillValues = mostRecentPeriod
    ? {
        netSalary: mostRecentPeriod.netSalary,
        savingsGoal: mostRecentPeriod.savingsGoal,
        month: mostRecentPeriod.month === 12 ? 1 : mostRecentPeriod.month + 1,
        year: mostRecentPeriod.month === 12 ? mostRecentPeriod.year + 1 : mostRecentPeriod.year,
      }
    : undefined

  // Money left over from the most recent period (informational rollover)
  const previousSavings = mostRecentPeriod
    ? mostRecentPeriod.netSalary -
      allExpenses
        .filter((e) => e.periodId === mostRecentPeriod.id)
        .reduce((sum, e) => sum + e.amount, 0)
    : undefined

  async function handleCreate(values: { month: number; year: number; netSalary: number; savingsGoal?: number }) {
    setFormError(null)
    const result = await createPeriod(values)
    if (!result.success) {
      setFormError(result.error ?? 'No se pudo crear el período.')
      return
    }
    setModal(null)
  }

  function handleEdit(values: { month: number; year: number; netSalary: number; savingsGoal?: number }) {
    if (!activePeriod) return
    updatePeriod(activePeriod.id, { netSalary: values.netSalary, savingsGoal: values.savingsGoal })
    setModal(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary sm:text-2xl">Configuración y Períodos</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Gestiona tu período presupuestario y sueldo neto mensual.
          </p>
        </div>
        <Button onClick={() => { setFormError(null); setModal('create') }}>
          Nuevo período
        </Button>
      </div>

      {/* Settings card */}
      <section className="rounded-card bg-bg-card p-6 shadow-card">
        <h2 className="mb-4 text-base font-semibold text-text-primary">Período activo</h2>

        {activePeriod ? (
          <PeriodHeader period={activePeriod} onEdit={() => { setFormError(null); setModal('edit') }} />
        ) : (
          <EmptyState
            message="Aún no tienes ningún período configurado. Crea uno para empezar a registrar tus gastos."
            actionLabel="Crear primer período"
            onAction={() => { setFormError(null); setModal('create') }}
            icon="📅"
          />
        )}

        {formError && (
          <p role="alert" className="mt-4 rounded-md bg-danger/10 px-4 py-2 text-sm text-danger">
            {formError}
          </p>
        )}
      </section>

      <Modal
        open={modal !== null}
        title={modal === 'edit' ? 'Editar período' : 'Nuevo período'}
        onClose={() => setModal(null)}
      >
        {modal === 'edit' && activePeriod ? (
          <PeriodForm
            onSubmit={handleEdit}
            onCancel={() => setModal(null)}
            initialValues={{
              month: activePeriod.month,
              year: activePeriod.year,
              netSalary: activePeriod.netSalary,
              savingsGoal: activePeriod.savingsGoal,
            }}
            editMode
          />
        ) : (
          <PeriodForm
            onSubmit={handleCreate}
            onCancel={() => setModal(null)}
            initialValues={prefillValues}
            prefillHint={!!prefillValues}
            previousSavings={previousSavings}
          />
        )}
      </Modal>
    </div>
  )
}
