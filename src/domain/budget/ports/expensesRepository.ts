import type { Expense } from '../model/types'

export interface ExpensesRepository {
  getAll(): Promise<Expense[]>
  create(expense: Expense): Promise<Expense>
  update(id: string, patch: Partial<Omit<Expense, 'id' | 'createdAt'>>): Promise<void>
  delete(id: string): Promise<void>
  deleteByPeriod(periodId: string): Promise<void>
}
