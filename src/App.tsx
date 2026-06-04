import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { AuthProvider } from './adapters/auth/AuthContext'

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
