type ValidationResult = { valid: boolean; error?: string }

type ExpenseInput = {
  periodId: string
  categoryId: string
  description: string
  amount: number
}

export function validateExpense(expense: ExpenseInput): ValidationResult {
  if (!expense.periodId) {
    return { valid: false, error: 'El período es obligatorio.' }
  }
  if (!expense.categoryId) {
    return { valid: false, error: 'La categoría es obligatoria.' }
  }
  if (!expense.description.trim()) {
    return { valid: false, error: 'La descripción es obligatoria.' }
  }
  if (expense.amount <= 0) {
    return { valid: false, error: 'El importe debe ser mayor que 0.' }
  }
  return { valid: true }
}
