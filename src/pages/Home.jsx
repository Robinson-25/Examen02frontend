import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user, isAdmin, isModerator } = useAuth()

  // Menú principal: las opciones dependen del rol
  const cards = [
    { to: '/medicamentos', title: 'Medicamentos', text: isModerator ? 'Registra, edita y consulta el catálogo.' : 'Consulta el catálogo y el stock.' },
    isModerator && { to: '/tipos', title: 'Tipos de medicamento', text: 'Administra las categorías del catálogo.' },
    isAdmin && { to: '/usuarios', title: 'Usuarios', text: 'Revisa las cuentas y sus roles.' },
  ].filter(Boolean)

  const permisos = isAdmin
    ? 'Puedes ver, crear, editar y eliminar registros.'
    : isModerator
      ? 'Puedes ver, crear y editar registros.'
      : 'Puedes consultar los registros.'

  return (
    <>
      <h1 className="text-2xl font-bold">Hola, {user.username}</h1>
      <p className="mt-1 text-slate-600">{permisos}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-600 hover:shadow"
          >
            <h2 className="font-semibold text-emerald-800">{c.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{c.text}</p>
          </Link>
        ))}
      </div>
    </>
  )
}
