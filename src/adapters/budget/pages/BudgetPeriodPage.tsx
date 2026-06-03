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

  function handleCreate(values: { month: number; year: number; netSalary: number }) {
    setFormError(null)
    const result = createPeriod(values)
    if (!result.success) {
      setFormError(result.error ?? 'No se pudo crear el período.')
      return
    }
    setModal(null)
  }

  function handleEdit(values: { month: number; year: number; netSalary: number }) {
    if (!activePeriod) return
    updatePeriod(activePeriod.id, { netSalary: values.netSalary })
    setModal(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Período presupuestario</h1>
        <Button onClick={() => { setFormError(null); setModal('create') }}>
          Nuevo período
        </Button>
      </div>

      {activePeriod ? (
        <PeriodHeader period={activePeriod} onEdit={() => { setFormError(null); setModal('edit') }} />
      ) : (
        <EmptyState message="Configurá tu primer período para empezar a registrar tus gastos." />
      )}

      {formError && (
        <p role="alert" className="rounded-md bg-danger/10 px-4 py-2 text-sm text-danger">
          {formError}
        </p>
      )}

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
