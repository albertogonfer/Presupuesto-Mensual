import type { RecurringExpense } from '../model/types'

export interface RecurringExpensesRepository {
  getAll(): Promise<RecurringExpense[]>
  create(expense: RecurringExpense): Promise<RecurringExpense>
  update(id: string, patch: Partial<Omit<RecurringExpense, 'id' | 'createdAt'>>): Promise<void>
  delete(id: string): Promise<void>
}
