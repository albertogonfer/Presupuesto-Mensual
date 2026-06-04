import { test, expect } from '@playwright/test'

test.describe('Full flow: salary → expense → dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to start fresh
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.removeItem('budget-categories')
      localStorage.removeItem('budget-periods')
      localStorage.removeItem('budget-expenses')
    })
    await page.reload()
  })

  test('creates a period with salary, adds an expense, and views dashboard summary', async ({ page }) => {
    // 1. Navigate to Settings and create a period
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Nuevo período' }).click()

    // Fill period form (current month/year defaults, set salary)
    const salaryInput = page.getByLabel(/sueldo/i)
    await salaryInput.fill('2000')
    await page.getByRole('button', { name: /guardar|crear|aceptar/i }).click()

    // 2. Navigate to Gastos and add an expense
    await page.goto('/expenses')
    await page.getByRole('button', { name: 'Nuevo gasto' }).click()

    await page.getByLabel(/descripción/i).fill('Supermercado')
    await page.getByLabel(/importe/i).fill('150')
    // Category should be pre-seeded — select "Comida"
    const categorySelect = page.getByLabel(/categoría/i)
    await categorySelect.selectOption({ label: 'Comida' })
    await page.getByRole('button', { name: /guardar|añadir|aceptar/i }).click()

    // Expense should appear
    await expect(page.getByText('Supermercado')).toBeVisible()

    // 3. Navigate to Dashboard and verify summary
    await page.goto('/')

    // Should show total spent
    await expect(page.getByText(/total gastado/i)).toBeVisible()
    await expect(page.getByText('150,00 €')).toBeVisible()

    // Remaining = 2000 - 150 = 1850
    await expect(page.getByText('1.850,00 €')).toBeVisible()
  })
})
