import { supabase } from '../../lib/supabase'
import type { RecurringExpense } from '../../domain/budget/model/types'
import type { RecurringExpensesRepository } from '../../domain/budget/ports/recurringExpensesRepository'

type RecurringExpenseRow = {
  id: string
  category_id: string
  description: string
  amount: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  every: number
  ends_at: string | null
  ends_after: number | null
  occurrence_count: number
  user_id: string
  created_at: string
  active: boolean
  final_payment_amount: number | null
}

function toRecurringExpense(row: RecurringExpenseRow): RecurringExpense {
  return {
    id: row.id,
    categoryId: row.category_id,
    description: row.description,
    amount: row.amount,
    frequency: row.frequency,
    every: row.every,
    ...(row.ends_at != null ? { endsAt: row.ends_at } : {}),
    ...(row.ends_after != null ? { endsAfter: row.ends_after } : {}),
    occurrenceCount: row.occurrence_count,
    createdAt: row.created_at,
    active: row.active,
    ...(row.final_payment_amount != null ? { finalPaymentAmount: row.final_payment_amount } : {}),
  }
}

async function requireUser(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

export const recurringExpensesRepository: RecurringExpensesRepository = {
  async getAll(): Promise<RecurringExpense[]> {
    const { data, error } = await supabase
      .from('recurring_expenses')
      .select('*')
      .order('created_at')
    if (error) throw new Error('Failed to fetch recurring expenses')
    return (data ?? []).map(toRecurringExpense)
  },

  async create(expense: RecurringExpense): Promise<RecurringExpense> {
    const userId = await requireUser()
    const { data, error } = await supabase
      .from('recurring_expenses')
      .insert({
        id: expense.id,
        category_id: expense.categoryId,
        description: expense.description,
        amount: expense.amount,
        frequency: expense.frequency,
        every: expense.every,
        ends_at: expense.endsAt ?? null,
        ends_after: expense.endsAfter ?? null,
        occurrence_count: expense.occurrenceCount,
        user_id: userId,
        created_at: expense.createdAt,
        active: expense.active,
        final_payment_amount: expense.finalPaymentAmount ?? null,
      })
      .select()
      .single()
    if (error) throw new Error('Failed to create recurring expense')
    return toRecurringExpense(data)
  },

  async update(id: string, patch: Partial<Omit<RecurringExpense, 'id' | 'createdAt'>>): Promise<void> {
    const dbPatch: Record<string, unknown> = {}
    if (patch.categoryId !== undefined) dbPatch.category_id = patch.categoryId
    if (patch.description !== undefined) dbPatch.description = patch.description
    if (patch.amount !== undefined) dbPatch.amount = patch.amount
    if (patch.frequency !== undefined) dbPatch.frequency = patch.frequency
    if (patch.every !== undefined) dbPatch.every = patch.every
    if (patch.endsAt !== undefined) dbPatch.ends_at = patch.endsAt
    if (patch.endsAfter !== undefined) dbPatch.ends_after = patch.endsAfter
    if (patch.occurrenceCount !== undefined) dbPatch.occurrence_count = patch.occurrenceCount
    if (patch.active !== undefined) dbPatch.active = patch.active
    if (patch.finalPaymentAmount !== undefined) dbPatch.final_payment_amount = patch.finalPaymentAmount

    const { error } = await supabase
      .from('recurring_expenses')
      .update(dbPatch)
      .eq('id', id)
    if (error) throw new Error('Failed to update recurring expense')
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('recurring_expenses')
      .delete()
      .eq('id', id)
    if (error) throw new Error('Failed to delete recurring expense')
  },
}
