import { supabase } from '../../lib/supabase'
import type { Expense } from '../../domain/budget/model/types'
import type { ExpensesRepository } from '../../domain/budget/ports/expensesRepository'

type ExpenseRow = {
  id: string
  period_id: string
  category_id: string
  description: string
  amount: number
  date: string
  user_id: string
  created_at: string
}

function toExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    periodId: row.period_id,
    categoryId: row.category_id,
    description: row.description,
    amount: row.amount,
    date: row.date,
    createdAt: row.created_at,
  }
}

async function requireUser(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')
  return session!.user.id
}

export const expensesRepository: ExpensesRepository = {
  async getAll(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at')
    if (error) throw new Error('Failed to fetch expenses')
    return (data ?? []).map(toExpense)
  },

  async create(expense: Expense): Promise<Expense> {
    const userId = await requireUser()
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        id: expense.id,
        period_id: expense.periodId,
        category_id: expense.categoryId,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        user_id: userId,
        created_at: expense.createdAt,
      })
      .select()
      .single()
    if (error) throw new Error('Failed to create expense')
    return toExpense(data)
  },

  async update(id: string, patch: Partial<Omit<Expense, 'id' | 'createdAt'>>): Promise<void> {
    const dbPatch: Record<string, unknown> = {}
    if (patch.periodId !== undefined) dbPatch.period_id = patch.periodId
    if (patch.categoryId !== undefined) dbPatch.category_id = patch.categoryId
    if (patch.description !== undefined) dbPatch.description = patch.description
    if (patch.amount !== undefined) dbPatch.amount = patch.amount
    if (patch.date !== undefined) dbPatch.date = patch.date

    const { error } = await supabase
      .from('expenses')
      .update(dbPatch)
      .eq('id', id)
    if (error) throw new Error('Failed to update expense')
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
    if (error) throw new Error('Failed to delete expense')
  },

  async deleteByPeriod(periodId: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('period_id', periodId)
    if (error) throw new Error('Failed to delete expenses for period')
  },
}
