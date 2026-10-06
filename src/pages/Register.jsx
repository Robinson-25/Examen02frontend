import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api, { errorMessage } from '../api'
import Field from '../components/Field'
import Alert from '../components/Alert'

export default function Register() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // Validación en el front-end antes de enviar al back-end
  const validate = () => {
    const e = {}
    const username = form.username.trim()
    if (username.length < 3 || username.length > 30) e.username = 'Entre 3 y 30 caracteres'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Ingresa un correo válido'
    if (form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    if (form.confirm !== form.password) e.confirm = 'Las contraseñas no coinciden'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    setServerError('')
    if (!validate()) return
    setLoading(true)
    try {
      await api.post('/auth/signup', {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setServerError(errorMessage(err))
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto mt-6 max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-1 text-2xl font-bold">Crear cuenta</h1>
      <p className="mb-5 text-sm text-slate-500">Las cuentas nuevas se crean con el rol Usuario.</p>

      <Alert>{serverError}</Alert>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Field label="Usuario" name="username" autoComplete="username" value={form.username} onChange={onChange} error={errors.username} />
        <Field label="Correo" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} error={errors.email} />
        <Field label="Contraseña" name="password" type="password" autoComplete="new-password" value={form.password} onChange={onChange} error={errors.password} />
        <Field label="Repetir contraseña" name="confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={onChange} error={errors.confirm} />
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Registrando…' : 'Registrarme'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
