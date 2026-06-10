import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Layout } from '@/adapters/budget/components/Layout'
import { AuthProvider } from '@/adapters/auth/AuthContext'

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <AuthProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </AuthProvider>,
  )
}

describe('Layout', () => {
  it('renders navigation links for Dashboard, Gastos, Categorías, Configuración', () => {
    renderWithProviders(<Layout><p>Content</p></Layout>)
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    // Gastos/Categorías/Historial appear in both the desktop and mobile navs
    expect(screen.getAllByRole('link', { name: 'Gastos' }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByRole('link', { name: 'Categorías' }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('link', { name: 'Configuración' })).toBeInTheDocument()
  })

  it('renders the mobile bottom navigation', () => {
    renderWithProviders(<Layout><p>Content</p></Layout>)
    const bottomNav = screen.getByRole('navigation', { name: 'Navegación principal' })
    expect(bottomNav).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ajustes' })).toBeInTheDocument()
  })

  it('renders children content inside the layout', () => {
    renderWithProviders(<Layout><p>Page body here</p></Layout>)
    expect(screen.getByText('Page body here')).toBeInTheDocument()
  })

  it('renders the app name in the header', () => {
    renderWithProviders(<Layout><div /></Layout>)
    expect(screen.getByText('Presupuesto Mensual')).toBeInTheDocument()
  })
})
