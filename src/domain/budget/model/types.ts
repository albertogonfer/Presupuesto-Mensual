export type Category = {
  id: string
  name: string
  color: string   // hex, used in charts
  icon: string    // emoji
  createdAt: string // ISO date string
}

export type BudgetPeriod = {
  id: string
  month: number   // 1-12
  year: number
  netSalary: number
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

export type BudgetSummary = {
  totalSpent: number
  remaining: number
  byCategory: Array<{
    category: Category
    total: number
    percentage: number
  }>
}
