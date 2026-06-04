import { useState, useMemo } from 'react'
import type { Expense } from '../../../domain/budget/model/types'
import { useExpenses } from '../hooks/useExpenses'
import { useCategories } from '../hooks/useCategories'
import { usePeriodsStore } from '../store/periodsStore'
import { ExpenseRow } from '../components/ExpenseRow'
import { ExpenseForm } from '../components/ExpenseForm'
import { RecurringExpiryBanner } from '../components/RecurringExpiryBanner'
import { Modal } from '../../shared/components/Modal'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import { Button } from '../../shared/components/Button'
import { EmptyState } from '../../shared/components/EmptyState'

type ModalMode = { type: 'add' } | { type: 'edit'; expense: Expense } | null
type ConfirmDeleteState = { id: string; description: string } | null

type SortOrder = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

export default function ExpensesPage() {
  const activePeriodId = usePeriodsStore((s) => s.activePeriodId)
  const { expenses, addExpense, updateExpense, removeExpense } = useExpenses()
  const { categories } = useCategories()
  const [modal, setModal] = useState<ModalMode>(null)
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState>(null)
  const [filterCategoryId, setFilterCategoryId] = useState<string>('')
  const [searchText, setSearchText] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc')

  const filteredExpenses = useMemo(() => {
    let result = [...expenses]

    if (filterCategoryId) {
      result = result.filter((e) => e.categoryId === filterCategoryId)
    }

    if (searchText.trim()) {
      const term = searchText.trim().toLowerCase()
      result = result.filter((e) => e.description.toLowerCase().includes(term))
    }

    result.sort((a, b) => {
      switch (sortOrder) {
        case 'date-desc': {
          const cmp = b.date.localeCompare(a.date)
          return cmp !== 0 ? cmp : b.createdAt.localeCompare(a.createdAt)
        }
        case 'date-asc': {
          const cmp = a.date.localeCompare(b.date)
          return cmp !== 0 ? cmp : a.createdAt.localeCompare(b.createdAt)
        }
        case 'amount-desc': {
          const cmp = b.amount - a.amount
          return cmp !== 0 ? cmp : b.createdAt.localeCompare(a.createdAt)
        }
        case 'amount-asc': {
          const cmp = a.amount - b.amount
          return cmp !== 0 ? cmp : a.createdAt.localeCompare(b.createdAt)
        }
      }
    })

    return result
  }, [expenses, filterCategoryId, searchText, sortOrder])

  const hasActiveFilters = filterCategoryId !== '' || searchText.trim() !== ''

  if (!activePeriodId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-text-primary">Gastos</h1>
        <EmptyState message="Configura un período con tu sueldo antes de registrar gastos." icon="⚙️" />
      </div>
    )
  }

  function handleDeleteRequest(id: string) {
    const expense = expenses.find((e) => e.id === id)
    if (!expense) return
    setConfirmDelete({ id, description: expense.description })
  }

  function handleConfirmDelete() {
    if (!confirmDelete) return
    removeExpense(confirmDelete.id)
    setConfirmDelete(null)
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
      <RecurringExpiryBanner />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Gastos</h1>
        <Button onClick={() => setModal({ type: 'add' })}>Nuevo gasto</Button>
      </div>

      {expenses.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <label className="sr-only" htmlFor="filter-category">Categoría</label>
          <select
            id="filter-category"
            aria-label="Categoría"
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            className="rounded border border-border bg-bg-card px-3 py-1.5 text-sm text-text-primary"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <label className="sr-only" htmlFor="search-text">Buscar</label>
          <input
            id="search-text"
            aria-label="Buscar"
            type="text"
            placeholder="Buscar por descripción..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="rounded border border-border bg-bg-card px-3 py-1.5 text-sm text-text-primary"
          />

          <label className="sr-only" htmlFor="sort-order">Ordenar</label>
          <select
            id="sort-order"
            aria-label="Ordenar"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="rounded border border-border bg-bg-card px-3 py-1.5 text-sm text-text-primary"
          >
            <option value="date-desc">Más reciente primero</option>
            <option value="date-asc">Más antiguo primero</option>
            <option value="amount-desc">Mayor importe primero</option>
            <option value="amount-asc">Menor importe primero</option>
          </select>

          {hasActiveFilters && (
            <span className="self-center text-sm text-text-secondary">
              {filteredExpenses.length} de {expenses.length} gastos
            </span>
          )}
        </div>
      )}

      {expenses.length === 0 ? (
        <EmptyState
          message="Añade tu primer gasto para empezar a controlar tu presupuesto."
            icon="💰"
        />
      ) : filteredExpenses.length === 0 ? (
        <EmptyState message="No hay gastos que coincidan con los filtros aplicados." icon="🔍" />
      ) : (
        <div className="overflow-hidden rounded-card bg-bg-card shadow-card">
          {filteredExpenses.map((expense, idx) => {
            const category = categories.find((c) => c.id === expense.categoryId)
            return (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                category={category}
                onEdit={(e) => setModal({ type: 'edit', expense: e })}
                onDelete={handleDeleteRequest}
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

      <ConfirmDialog
        open={confirmDelete !== null}
        title="¿Eliminar gasto?"
        message={confirmDelete ? `Se eliminará «${confirmDelete.description}» de forma permanente.` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
