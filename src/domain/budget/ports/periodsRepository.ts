import type { BudgetPeriod } from '../model/types'

export interface PeriodsRepository {
  getAll(): Promise<BudgetPeriod[]>
  create(period: BudgetPeriod): Promise<BudgetPeriod>
  update(id: string, patch: Partial<Omit<BudgetPeriod, 'id' | 'createdAt'>>): Promise<void>
  delete(id: string): Promise<void>
}
