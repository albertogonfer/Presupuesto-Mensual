import { useState } from 'react'
import { usePeriods } from '../hooks/usePeriods'
import { PeriodHeader } from '../components/PeriodHeader'
import { PeriodForm } from '../components/PeriodForm'
import { Modal } from '../../shared/components/Modal'
import { Button } from '../../shared/components/Button'
import { EmptyState } from '../../shared/components/EmptyState'

type ModalMode = 'create' | 'edit' | null

export default function BudgetPeriodPage() {
  const { activePeriod, createPeriod, updatePeriod } = usePeriods()
  const [modal, setModal] = useState<ModalMode>(null)
  const [formError, setFormError] = useState<string | null>(null)

  function handleCreate(values: { month: number; year: number; netSalary: number; savingsGoal?: number }) {
    setFormError(null)
    const result = createPeriod(values)
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
          <h1 className="text-2xl font-semibold text-text-primary">Configuración</h1>
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
          />
        )}
      </Modal>
    </div>
  )
}
