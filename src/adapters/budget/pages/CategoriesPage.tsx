import { useState } from 'react'
import type { Category } from '../../../domain/budget/model/types'
import { useCategories } from '../hooks/useCategories'
import { useCategoriesStore } from '../store/categoriesStore'
import { useExpensesStore } from '../store/expensesStore'
import { CategoryCard } from '../components/CategoryCard'
import { CategoryForm } from '../components/CategoryForm'
import { Modal } from '../../shared/components/Modal'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import { Button } from '../../shared/components/Button'
import { EmptyState } from '../../shared/components/EmptyState'
import { PageSpinner } from '../../shared/components/PageSpinner'
import { StoreError } from '../../shared/components/StoreError'

type ModalMode = { type: 'add' } | { type: 'edit'; category: Category } | null
type ConfirmDeleteState = { id: string; name: string } | null

export default function CategoriesPage() {
  const { categories, addCategory, updateCategory, removeCategory } = useCategories()
  const allExpenses = useExpensesStore((s) => s.expenses)
  const expenseCategoryIds = allExpenses.map((e) => e.categoryId)
  const loading = useCategoriesStore((s) => s.loading)
  const error = useCategoriesStore((s) => s.error)
  const fetchCategories = useCategoriesStore((s) => s.fetchAll)
  const [modal, setModal] = useState<ModalMode>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState>(null)

  if (loading) return <PageSpinner />
  if (error) return <StoreError onRetry={fetchCategories} />

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

  function handleSubmit(values: { name: string; color: string; icon: string; limit?: number }) {
    if (modal?.type === 'edit') {
      updateCategory(modal.category.id, values)
    } else {
      addCategory(values)
    }
    setModal(null)
  }

  const editingCategory = modal?.type === 'edit' ? modal.category : undefined

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Categorías</h1>
        <Button onClick={() => { setModal({ type: 'add' }); setDeleteError(null) }}>
          Nueva categoría
        </Button>
      </div>

      {deleteError && (
        <p role="alert" className="rounded-md bg-danger/10 px-4 py-2 text-sm text-danger">
          {deleteError}
        </p>
      )}

      {categories.length === 0 ? (
        <EmptyState
          message="Crea tu primera categoría para clasificar tus gastos."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
    </div>
  )
}
