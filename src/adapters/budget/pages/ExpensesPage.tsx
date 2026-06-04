import { useState } from 'react'
import type { Expense } from '../../../domain/budget/model/types'
import { useExpenses } from '../hooks/useExpenses'
import { useCategories } from '../hooks/useCategories'
import { usePeriodsStore } from '../store/periodsStore'
import { ExpenseRow } from '../components/ExpenseRow'
import { ExpenseForm } from '../components/ExpenseForm'
import { Modal } from '../../shared/components/Modal'
import { Button } from '../../shared/components/Button'
import { EmptyState } from '../../shared/components/EmptyState'

type ModalMode = { type: 'add' } | { type: 'edit'; expense: Expense } | null

export default function ExpensesPage() {
  const activePeriodId = usePeriodsStore((s) => s.activePeriodId)
  const { expenses, addExpense, updateExpense, removeExpense } = useExpenses()
  const { categories } = useCategories()
  const [modal, setModal] = useState<ModalMode>(null)

  if (!activePeriodId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-text-primary">Gastos</h1>
        <EmptyState message="Configura un período con tu sueldo antes de registrar gastos." icon="⚙️" />
      </div>
    )
  }

  function handleSubmit(values: { description: string; amount: number; categoryId: string; date: string }) {
    if (modal?.type === 'edit') {
      updateExpense(modal.expense.id, values)
    } else {
      addExpense({ ...values, periodId: activePeriodId! })
    }
    setModal(null)
  }

  const editingExpense = modal?.type === 'edit' ? modal.expense : undefined

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Gastos</h1>
        <Button onClick={() => setModal({ type: 'add' })}>Nuevo gasto</Button>
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          message="Añade tu primer gasto para empezar a controlar tu presupuesto."
            icon="💰"
        />
      ) : (
        <div className="overflow-hidden rounded-card bg-bg-card shadow-card">
          {expenses.map((expense, idx) => {
            const category = categories.find((c) => c.id === expense.categoryId)
            return (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                category={category}
                onEdit={(e) => setModal({ type: 'edit', expense: e })}
                onDelete={removeExpense}
                alternate={idx % 2 === 1}
              />
            )
          })}
        </div>
      )}

      <Modal
        open={modal !== null}
        title={modal?.type === 'edit' ? 'Editar gasto' : 'Nuevo gasto'}
        onClose={() => setModal(null)}
      >
        <ExpenseForm
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => setModal(null)}
          initialValues={
            editingExpense
              ? {
                  description: editingExpense.description,
                  amount: editingExpense.amount,
                  categoryId: editingExpense.categoryId,
                  date: editingExpense.date,
                }
              : undefined
          }
        />
      </Modal>
    </div>
  )
}
