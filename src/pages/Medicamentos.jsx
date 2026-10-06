import { useEffect, useState } from 'react'
import api, { errorMessage } from '../api'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import Field from '../components/Field'
import Alert from '../components/Alert'

const EMPTY = {
  descripcionMed: '', Marca: '', Presentacion: '', CodTipoMed: '',
  fechaFabricacion: '', fechaVencimiento: '', stock: '', precioVentaUni: '', precioVentaPres: '',
}

const money = (n) => `S/ ${Number(n).toFixed(2)}`
const fecha = (iso) => iso.split('-').reverse().join('/')

export default function Medicamentos() {
  const { isAdmin, isModerator } = useAuth()
  const [items, setItems] = useState([])
  const [tipos, setTipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // null = cerrado | {} = nuevo | {...} = editar
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () =>
    Promise.all([api.get('/medicamentos'), api.get('/tipos')])
      .then(([meds, tps]) => { setItems(meds.data); setTipos(tps.data) })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const openForm = (med = {}) => {
    setEditing(med)
    setForm(med.CodMedicamento ? Object.fromEntries(Object.keys(EMPTY).map((k) => [k, String(med[k])])) : EMPTY)
    setErrors({})
    setFormError('')
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // Validación en el front-end antes de enviar al back-end
  const validate = () => {
    const e = {}
    if (form.descripcionMed.trim().length < 3) e.descripcionMed = 'Mínimo 3 caracteres'
    if (!form.Marca.trim()) e.Marca = 'Ingresa la marca'
    if (!form.Presentacion.trim()) e.Presentacion = 'Ingresa la presentación'
    if (!form.CodTipoMed) e.CodTipoMed = 'Selecciona un tipo'
    if (!form.fechaFabricacion) e.fechaFabricacion = 'Ingresa la fecha'
    if (!form.fechaVencimiento) e.fechaVencimiento = 'Ingresa la fecha'
    else if (form.fechaFabricacion && form.fechaVencimiento <= form.fechaFabricacion) {
      e.fechaVencimiento = 'Debe ser posterior a la fabricación'
    }
    if (form.stock === '' || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
      e.stock = 'Número entero, 0 o mayor'
    }
    for (const k of ['precioVentaUni', 'precioVentaPres']) {
      if (form[k] === '' || Number.isNaN(Number(form[k])) || Number(form[k]) <= 0) e[k] = 'Debe ser mayor que 0'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    setFormError('')
    if (!validate()) return
    const payload = {
      ...form,
      descripcionMed: form.descripcionMed.trim(),
      Marca: form.Marca.trim(),
      Presentacion: form.Presentacion.trim(),
      CodTipoMed: Number(form.CodTipoMed),
      stock: Number(form.stock),
      precioVentaUni: Number(form.precioVentaUni),
      precioVentaPres: Number(form.precioVentaPres),
    }
    setSaving(true)
    try {
      if (editing.CodMedicamento) await api.put(`/medicamentos/${editing.CodMedicamento}`, payload)
      else await api.post('/medicamentos', payload)
      setEditing(null)
      setError('')
      await load()
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (med) => {
    if (!window.confirm(`¿Eliminar "${med.descripcionMed}"?`)) return
    try {
      await api.delete(`/medicamentos/${med.CodMedicamento}`)
      setError('')
      await load()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const q = search.trim().toLowerCase()
  const filtered = items.filter((m) =>
    [m.descripcionMed, m.Marca, m.tipo?.descripcion].some((v) => v?.toLowerCase().includes(q)),
  )
  const columns = isModerator ? 8 : 7

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-bold">Medicamentos</h1>
        <input
          className="input w-full sm:w-64"
          type="search"
          placeholder="Buscar por nombre, marca o tipo"
          aria-label="Buscar medicamentos"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {isModerator && <button className="btn btn-primary" onClick={() => openForm()}>Nuevo medicamento</button>}
      </div>

      <Alert>{error}</Alert>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-emerald-50 text-emerald-900">
            <tr>
              <th className="px-4 py-3 font-semibold">Medicamento</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Marca</th>
              <th className="px-4 py-3 font-semibold">Vence</th>
              <th className="px-4 py-3 text-right font-semibold">Stock</th>
              <th className="px-4 py-3 text-right font-semibold">P. unidad</th>
              <th className="px-4 py-3 text-right font-semibold">P. presentación</th>
              {isModerator && <th className="px-4 py-3 text-right font-semibold">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((m) => (
              <tr key={m.CodMedicamento}>
                <td className="px-4 py-3">
                  <div className="font-medium">{m.descripcionMed}</div>
                  <div className="text-xs text-slate-500">{m.Presentacion}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                    {m.tipo?.descripcion}
                  </span>
                </td>
                <td className="px-4 py-3">{m.Marca}</td>
                <td className="px-4 py-3 whitespace-nowrap">{fecha(m.fechaVencimiento)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{m.stock}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">{money(m.precioVentaUni)}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">{money(m.precioVentaPres)}</td>
                {isModerator && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="btn btn-secondary px-3 py-1.5" onClick={() => openForm(m)}>Editar</button>
                      {isAdmin && <button className="btn btn-danger px-3 py-1.5" onClick={() => onDelete(m)}>Eliminar</button>}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={columns} className="px-4 py-8 text-center text-slate-500">
                  {loading ? 'Cargando…' : q ? 'Ningún medicamento coincide con la búsqueda.' : 'Aún no hay medicamentos registrados.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing.CodMedicamento ? 'Editar medicamento' : 'Nuevo medicamento'} onClose={() => setEditing(null)}>
          <Alert>{formError}</Alert>
          <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
            <Field className="sm:col-span-2" label="Descripción" name="descripcionMed" autoFocus maxLength={150} value={form.descripcionMed} onChange={onChange} error={errors.descripcionMed} />
            <Field label="Marca" name="Marca" maxLength={80} value={form.Marca} onChange={onChange} error={errors.Marca} />
            <Field label="Tipo de medicamento" name="CodTipoMed" as="select" value={form.CodTipoMed} onChange={onChange} error={errors.CodTipoMed}>
              <option value="">Selecciona…</option>
              {tipos.map((t) => <option key={t.CodTipoMed} value={t.CodTipoMed}>{t.descripcion}</option>)}
            </Field>
            <Field className="sm:col-span-2" label="Presentación" name="Presentacion" maxLength={80} placeholder="Caja x 100 tabletas" value={form.Presentacion} onChange={onChange} error={errors.Presentacion} />
            <Field label="Fecha de fabricación" name="fechaFabricacion" type="date" value={form.fechaFabricacion} onChange={onChange} error={errors.fechaFabricacion} />
            <Field label="Fecha de vencimiento" name="fechaVencimiento" type="date" value={form.fechaVencimiento} onChange={onChange} error={errors.fechaVencimiento} />
            <Field label="Stock" name="stock" type="number" min="0" step="1" value={form.stock} onChange={onChange} error={errors.stock} />
            <div className="hidden sm:block" />
            <Field label="Precio por unidad (S/)" name="precioVentaUni" type="number" min="0" step="0.01" value={form.precioVentaUni} onChange={onChange} error={errors.precioVentaUni} />
            <Field label="Precio por presentación (S/)" name="precioVentaPres" type="number" min="0" step="0.01" value={form.precioVentaPres} onChange={onChange} error={errors.precioVentaPres} />
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="btn btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
