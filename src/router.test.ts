import { describe, it, expect } from 'vitest'
import { routes } from './router'

describe('router', () => {
  it('defines a route for the dashboard at /', () => {
    const home = routes.find((r) => r.path === '/')
    expect(home).toBeDefined()
    expect(home?.label).toBe('Dashboard')
  })

  it('defines a route for expenses at /expenses', () => {
    const expenses = routes.find((r) => r.path === '/expenses')
    expect(expenses).toBeDefined()
    expect(expenses?.label).toBe('Gastos')
  })

  it('defines a route for categories at /categories', () => {
    const categories = routes.find((r) => r.path === '/categories')
    expect(categories).toBeDefined()
    expect(categories?.label).toBe('Categorías')
  })

  it('defines a route for settings at /settings', () => {
    const settings = routes.find((r) => r.path === '/settings')
    expect(settings).toBeDefined()
    expect(settings?.label).toBe('Configuración')
  })

  it('exposes exactly 4 routes', () => {
    expect(routes).toHaveLength(4)
  })
})
