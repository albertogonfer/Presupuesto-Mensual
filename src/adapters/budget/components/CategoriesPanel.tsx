import { useState } from 'react'
import type { Category } from '../../../domain/budget/model/types'
import { useCategories } from '../hooks/useCategories'
import { useExpensesStore } from '../store/expensesStore'
import { CategoryCard } from './CategoryCard'
import { CategoryForm } from './CategoryForm'
import { Modal } from '../../shared/components/Modal'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import { EmptyState } from '../../shared/components/EmptyState'

type ModalMode = { type: 'add' } | { type: 'edit'; category: Category } | null
type ConfirmDeleteState = { id: string; name: string } | null

// Compact categories panel for the split-pane "Gastos y Categorías" screen.
export function CategoriesPanel() {
  const { categories, addCategory, updateCategory, removeCategory } = useCategories()
  const allExpenses = useExpensesStore((s) => s.expenses)
  const expenseCategoryIds = allExpenses.map((e) => e.categoryId)
  const [modal, setModal] = useState<ModalMode>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState>(null)

  function handleDeleteRequest(id: string) {
    const category = categories.find((c) => c.id === id)
    if (!category) return
    setDeleteError(null)
    setConfirmDelete({ id, name: category.name })
  }

  async function handleConfirmDelete() {
    if (!confirmDelete) return
    const result = await removeCategory(confirmDelete.id, expenseCategoryIds)
    setConfirmDelete(null)
    if (!result.success) {
      setDeleteError(result.error ?? 'No se puede eliminar esta categoría.')
    }
  }

  async function handleSubmit(values: { name: string; color: string; icon: string; limit?: number }) {
    if (modal?.type === 'edit') {
      updateCategory(modal.category.id, values)
    } else {
      await addCategory(values)
    }
    setModal(null)
  }

  const editingCategory = modal?.type === 'edit' ? modal.category : undefined

  return (
    <section className="flex flex-col gap-3 rounded-card bg-bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">Categorías</h2>
        <button
          onClick={() => { setModal({ type: 'add' }); setDeleteError(null) }}
          className="rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white shadow-[0_0_12px_rgba(99,102,241,0.4)] transition-colors hover:bg-accent-hover"
        >
          + Nueva categoría
        </button>
      </div>

      {deleteError && (
        <p role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {deleteError}
        </p>
      )}

      {categories.length === 0 ? (
        <EmptyState message="Crea tu primera categoría para clasificar tus gastos." />
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onEdit={(c) => setModal({ type: 'edit', category: c })}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      )}

      <Modal
        open={modal !== null}
        title={modal?.type === 'edit' ? 'Editar categoría' : 'Nueva categoría'}
        onClose={() => setModal(null)}
      >
        <CategoryForm
          onSubmit={handleSubmit}
          onCancel={() => setModal(null)}
          initialValues={
            editingCategory
              ? { name: editingCategory.name, color: editingCategory.color, icon: editingCategory.icon, limit: editingCategory.limit }
              : undefined
          }
        />
      </Modal>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="¿Eliminar categoría?"
        message={confirmDelete ? `Se eliminará «${confirmDelete.name}» de forma permanente.` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </section>
  )
}
