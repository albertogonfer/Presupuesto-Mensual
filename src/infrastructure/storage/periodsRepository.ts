import { supabase } from '../../lib/supabase'
import type { BudgetPeriod } from '../../domain/budget/model/types'
import type { PeriodsRepository } from '../../domain/budget/ports/periodsRepository'

type PeriodRow = {
  id: string
  month: number
  year: number
  net_salary: number
  savings_goal: number | null
  user_id: string
  created_at: string
}

function toPeriod(row: PeriodRow): BudgetPeriod {
  return {
    id: row.id,
    month: row.month,
    year: row.year,
    netSalary: row.net_salary,
    ...(row.savings_goal != null ? { savingsGoal: row.savings_goal } : {}),
    createdAt: row.created_at,
  }
}

async function requireUser(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')
  return session!.user.id
}

export const periodsRepository: PeriodsRepository = {
  async getAll(): Promise<BudgetPeriod[]> {
    const { data, error } = await supabase
      .from('budget_periods')
      .select('*')
      .order('year')
      .order('month')
    if (error) throw new Error('Failed to fetch periods')
    return (data ?? []).map(toPeriod)
  },

  async create(period: BudgetPeriod): Promise<BudgetPeriod> {
    const userId = await requireUser()
    const { data, error } = await supabase
      .from('budget_periods')
      .insert({
        id: period.id,
        month: period.month,
        year: period.year,
        net_salary: period.netSalary,
        savings_goal: period.savingsGoal ?? null,
        user_id: userId,
        created_at: period.createdAt,
      })
      .select()
      .single()
    if (error) throw new Error('Failed to create period')
    return toPeriod(data)
  },

  async update(id: string, patch: Partial<Omit<BudgetPeriod, 'id' | 'createdAt'>>): Promise<void> {
    const dbPatch: Record<string, unknown> = {}
    if (patch.month !== undefined) dbPatch.month = patch.month
    if (patch.year !== undefined) dbPatch.year = patch.year
    if (patch.netSalary !== undefined) dbPatch.net_salary = patch.netSalary
    if (patch.savingsGoal !== undefined) dbPatch.savings_goal = patch.savingsGoal

    const { error } = await supabase
      .from('budget_periods')
      .update(dbPatch)
      .eq('id', id)
    if (error) throw new Error('Failed to update period')
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('budget_periods')
      .delete()
      .eq('id', id)
    if (error) throw new Error('Failed to delete period')
  },
}
