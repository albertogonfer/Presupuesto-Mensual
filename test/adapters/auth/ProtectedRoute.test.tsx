import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProtectedRoute } from '@/adapters/auth/ProtectedRoute'

vi.mock('@/adapters/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '@/adapters/auth/AuthContext'

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows spinner while loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      session: null, loading: true, user: null,
      signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
    })
    render(
      <MemoryRouter>
        <ProtectedRoute><div>protected</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.getByText('Cargando…')).toBeTruthy()
    expect(screen.queryByText('protected')).toBeNull()
  })

  it('redirects to /login when no session', () => {
    vi.mocked(useAuth).mockReturnValue({
      session: null, loading: false, user: null,
      signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
    })
    render(
      <MemoryRouter initialEntries={['/']}>
        <ProtectedRoute><div>protected</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.queryByText('protected')).toBeNull()
  })

  it('renders children when session exists', () => {
    vi.mocked(useAuth).mockReturnValue({
      session: { user: { id: 'u1' } } as any, loading: false, user: { id: 'u1' } as any,
      signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
    })
    render(
      <MemoryRouter>
        <ProtectedRoute><div>protected</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.getByText('protected')).toBeTruthy()
  })
})
