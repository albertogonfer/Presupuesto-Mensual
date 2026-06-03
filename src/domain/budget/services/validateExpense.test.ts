import { describe, it, expect } from 'vitest'
import { validateExpense } from './validateExpense'

const VALID = {
  periodId: 'period-1',
  categoryId: 'cat-1',
  description: 'Compra supermercado',
  amount: 50,
}

describe('validateExpense', () => {
  it('returns valid=true for a well-formed expense', () => {
    const result = validateExpense(VALID)
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('returns valid=false when amount is zero', () => {
    const result = validateExpense({ ...VALID, amount: 0 })
    expect(result.valid).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns valid=false when amount is negative', () => {
    const result = validateExpense({ ...VALID, amount: -10 })
    expect(result.valid).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns valid=false when description is empty', () => {
    const result = validateExpense({ ...VALID, description: '' })
    expect(result.valid).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns valid=false when description is whitespace only', () => {
    const result = validateExpense({ ...VALID, description: '   ' })
    expect(result.valid).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns valid=false when categoryId is empty', () => {
    const result = validateExpense({ ...VALID, categoryId: '' })
    expect(result.valid).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns valid=false when periodId is empty', () => {
    const result = validateExpense({ ...VALID, periodId: '' })
    expect(result.valid).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('accepts fractional amounts greater than 0', () => {
    const result = validateExpense({ ...VALID, amount: 0.01 })
    expect(result.valid).toBe(true)
  })
})
