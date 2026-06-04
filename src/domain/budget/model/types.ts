export type Category = {
  id: string
  name: string
  color: string   // hex, used in charts
  icon: string    // emoji
  limit?: number  // optional monthly budget limit in euros
  createdAt: string // ISO date string
}

export type BudgetPeriod = {
  id: string
  month: number   // 1-12
  year: number
  netSalary: number
  savingsGoal?: number  // optional monthly savings target in euros
  createdAt: string // ISO date string
}

export type Expense = {
  id: string
  periodId: string
  categoryId: string
  description: string
  amount: number
  date: string      // ISO date
  createdAt: string // ISO date string
}

export interface RecurringExpense {
  id: string
  categoryId: string
  description: string
  amount: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  every: number
  endsAt?: string       // ISO date — expires on this date
  endsAfter?: number    // expires after N total occurrences
  occurrenceCount: number
  createdAt: string
  active: boolean
}

export type BudgetSummary = {
  totalSpent: number
  remaining: number
  percentUsed: number
  byCategory: Array<{
    category: Category
    total: number
    percentage: number
  }>
  savingsGoal?: number
  savingsProgress?: number  // remaining - savingsGoal (can be negative)
}
