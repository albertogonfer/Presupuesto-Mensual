import { describe, it, expect } from 'vitest'
import { routes } from '@/router'

describe('router', () => {
  it('defines a route for the dashboard at /', () => {
    const home = routes.find((r) => r.path === '/')
    expect(home).toBeDefined()
    expect(home?.label).toBe('Dashboard')
  })

  it('defines a route for expenses (with categories) at /expenses', () => {
    const expenses = routes.find((r) => r.path === '/expenses')
    expect(expenses).toBeDefined()
    expect(expenses?.label).toBe('Gastos y Categorías')
  })

  it('defines a route for settings at /settings', () => {
    const settings = routes.find((r) => r.path === '/settings')
    expect(settings).toBeDefined()
    expect(settings?.label).toBe('Configuración')
  })

  it('defines a route for analytics/history at /history', () => {
    const history = routes.find((r) => r.path === '/history')
    expect(history).toBeDefined()
    expect(history?.label).toBe('Analítica')
  })

  it('defines a route for recurring expenses at /recurring', () => {
    const recurring = routes.find((r) => r.path === '/recurring')
    expect(recurring).toBeDefined()
    expect(recurring?.label).toBe('Recurrentes')
  })

  it('exposes exactly 5 routes', () => {
    expect(routes).toHaveLength(5)
  })
})
