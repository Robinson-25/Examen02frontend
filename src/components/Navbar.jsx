import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_LABEL = { admin: 'Administrador', moderator: 'Moderador', user: 'Usuario' }

export default function Navbar() {
  const { user, logout, isAdmin, isModerator } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  // Los elementos del menú dependen del rol del usuario
  const links = user
    ? [
        { to: '/', label: 'Inicio' },
        { to: '/medicamentos', label: 'Medicamentos' },
        isModerator && { to: '/tipos', label: 'Tipos de medicamento' },
        isAdmin && { to: '/usuarios', label: 'Usuarios' },
      ].filter(Boolean)
    : [
        { to: '/login', label: 'Iniciar sesión' },
        { to: '/registro', label: 'Registrarse' },
      ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-white/15 text-white' : 'text-emerald-50 hover:bg-white/10'
    }`

  return (
    <header className="bg-emerald-800 text-white shadow">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-xl leading-none text-emerald-800">+</span>
          Farmacia
        </Link>

        <button
          className="ml-auto cursor-pointer rounded-lg border border-white/30 px-3 py-1.5 text-sm md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          Menú
        </button>

        <div className={`${open ? 'flex' : 'hidden'} w-full flex-col gap-1 md:flex md:w-auto md:flex-1 md:flex-row md:items-center`}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end className={linkClass} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}

          {user && (
            <div className="mt-2 flex items-center gap-3 border-t border-white/20 pt-3 md:mt-0 md:ml-auto md:border-0 md:pt-0">
              <div className="text-sm leading-tight">
                <div className="font-semibold">{user.username}</div>
                <div className="text-xs text-emerald-200">{user.roles.map((r) => ROLE_LABEL[r] || r).join(', ')}</div>
              </div>
              <button onClick={handleLogout} className="btn ml-auto bg-white text-emerald-800 hover:bg-emerald-50">
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
