import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Medicamentos from './pages/Medicamentos'
import Tipos from './pages/Tipos'
import Usuarios from './pages/Usuarios'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/medicamentos" element={<Medicamentos />} />
          </Route>
          <Route element={<ProtectedRoute allow="moderator" />}>
            <Route path="/tipos" element={<Tipos />} />
          </Route>
          <Route element={<ProtectedRoute allow="admin" />}>
            <Route path="/usuarios" element={<Usuarios />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
