import { useEffect, useState } from 'react'
import api, { errorMessage } from '../api'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import Field from '../components/Field'
import Alert from '../components/Alert'

export default function Tipos() {
  const { isAdmin } = useAuth()
  const [tipos, setTipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null = cerrado | {} = nuevo | {...} = editar
  const [descripcion, setDescripcion] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () =>
    api.get('/tipos')
      .then((res) => setTipos(res.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const openForm = (tipo = {}) => {
    setEditing(tipo)
    setDescripcion(tipo.descripcion || '')
    setFieldError('')
    setFormError('')
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    const value = descripcion.trim()
    if (value.length < 3) return setFieldError('Mínimo 3 caracteres')
    setFieldError('')
    setSaving(true)
    try {
      if (editing.CodTipoMed) await api.put(`/tipos/${editing.CodTipoMed}`, { descripcion: value })
      else await api.post('/tipos', { descripcion: value })
      setEditing(null)
      setError('')
      await load()
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (tipo) => {
    if (!window.confirm(`¿Eliminar el tipo "${tipo.descripcion}"?`)) return
    try {
      await api.delete(`/tipos/${tipo.CodTipoMed}`)
      setError('')
      await load()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Tipos de medicamento</h1>
        <button className="btn btn-primary" onClick={() => openForm()}>Nuevo tipo</button>
      </div>

      <Alert>{error}</Alert>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-50 text-emerald-900">
            <tr>
              <th className="px-4 py-3 font-semibold">Código</th>
              <th className="px-4 py-3 font-semibold">Descripción</th>
              <th className="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tipos.map((t) => (
              <tr key={t.CodTipoMed}>
                <td className="px-4 py-3 text-slate-500">{t.CodTipoMed}</td>
                <td className="px-4 py-3 font-medium">{t.descripcion}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button className="btn btn-secondary px-3 py-1.5" onClick={() => openForm(t)}>Editar</button>
                    {isAdmin && <button className="btn btn-danger px-3 py-1.5" onClick={() => onDelete(t)}>Eliminar</button>}
                  </div>
                </td>
              </tr>
            ))}
            {!tipos.length && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                  {loading ? 'Cargando…' : 'Aún no hay tipos registrados.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing.CodTipoMed ? 'Editar tipo' : 'Nuevo tipo'} onClose={() => setEditing(null)}>
          <Alert>{formError}</Alert>
          <form onSubmit={onSubmit} noValidate>
            <Field label="Descripción" autoFocus maxLength={100} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} error={fieldError} />
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="btn btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
