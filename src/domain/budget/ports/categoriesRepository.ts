import type { Category } from '../model/types'

export interface CategoriesRepository {
  getAll(): Promise<Category[]>
  create(category: Omit<Category, 'createdAt'>): Promise<Category>
  update(id: string, patch: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<void>
  delete(id: string): Promise<void>
}
