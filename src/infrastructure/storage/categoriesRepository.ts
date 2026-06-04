import { supabase } from '../../lib/supabase'
import type { Category } from '../../domain/budget/model/types'
import type { CategoriesRepository } from '../../domain/budget/ports/categoriesRepository'

type CategoryRow = {
  id: string
  name: string
  color: string
  icon: string
  limit: number | null
  user_id: string
  created_at: string
}

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    ...(row.limit != null ? { limit: row.limit } : {}),
    createdAt: row.created_at,
  }
}

async function requireUser(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')
  return session!.user.id
}

export const categoriesRepository: CategoriesRepository = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at')
    if (error) throw new Error('Failed to fetch categories')
    return (data ?? []).map(toCategory)
  },

  async create(category: Omit<Category, 'createdAt'>): Promise<Category> {
    const userId = await requireUser()
    const { data, error } = await supabase
      .from('categories')
      .insert({
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        limit: category.limit ?? null,
        user_id: userId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) throw new Error('Failed to create category')
    return toCategory(data)
  },

  async update(id: string, patch: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .update(patch)
      .eq('id', id)
    if (error) throw new Error('Failed to update category')
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    if (error) throw new Error('Failed to delete category')
  },
}
