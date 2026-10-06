import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Sin sesión -> login. Con sesión pero sin el rol requerido -> inicio.
export default function ProtectedRoute({ allow }) {
  const auth = useAuth()
  if (!auth.user) return <Navigate to="/login" replace />
  if (allow === 'admin' && !auth.isAdmin) return <Navigate to="/" replace />
  if (allow === 'moderator' && !auth.isModerator) return <Navigate to="/" replace />
  return <Outlet />
}
