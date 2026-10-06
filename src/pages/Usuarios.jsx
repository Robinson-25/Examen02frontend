import { useEffect, useState } from 'react'
import api, { errorMessage } from '../api'
import Alert from '../components/Alert'

const ROLE_LABEL = { admin: 'Administrador', moderator: 'Moderador', user: 'Usuario' }

export default function Usuarios() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/users')
      .then((res) => setUsers(res.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <h1 className="mb-5 text-2xl font-bold">Usuarios</h1>
      <Alert>{error}</Alert>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-50 text-emerald-900">
            <tr>
              <th className="px-4 py-3 font-semibold">Usuario</th>
              <th className="px-4 py-3 font-semibold">Correo</th>
              <th className="px-4 py-3 font-semibold">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium">{u.username}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.roles.map((r) => ROLE_LABEL[r] || r).join(', ')}</td>
              </tr>
            ))}
            {!users.length && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">{loading ? 'Cargando…' : 'Sin usuarios.'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
