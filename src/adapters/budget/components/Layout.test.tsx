import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Layout } from './Layout'

function renderWithRouter(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('Layout', () => {
  it('renders navigation links for Dashboard, Gastos, Categorías, Configuración', () => {
    renderWithRouter(<Layout><p>Content</p></Layout>)
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Gastos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Categorías' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Configuración' })).toBeInTheDocument()
  })

  it('renders children content inside the layout', () => {
    renderWithRouter(<Layout><p>Page body here</p></Layout>)
    expect(screen.getByText('Page body here')).toBeInTheDocument()
  })

  it('renders the app name in the header', () => {
    renderWithRouter(<Layout><div /></Layout>)
    expect(screen.getByText('Presupuesto Mensual')).toBeInTheDocument()
  })
})
