import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../api'
import Field from '../components/Field'
import Alert from '../components/Alert'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // Validación en el front-end antes de enviar al back-end
  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Ingresa tu usuario'
    if (!form.password) e.password = 'Ingresa tu contraseña'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    setServerError('')
    if (!validate()) return
    setLoading(true)
    try {
      await login(form.username.trim(), form.password)
      navigate('/') // menú principal
    } catch (err) {
      setServerError(errorMessage(err))
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto mt-6 max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-1 text-2xl font-bold">Iniciar sesión</h1>
      <p className="mb-5 text-sm text-slate-500">Accede al sistema de la farmacia.</p>

      {location.state?.registered && <Alert type="success">Cuenta creada. Ya puedes iniciar sesión.</Alert>}
      <Alert>{serverError}</Alert>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Field label="Usuario" name="username" autoComplete="username" value={form.username} onChange={onChange} error={errors.username} />
        <Field label="Contraseña" name="password" type="password" autoComplete="current-password" value={form.password} onChange={onChange} error={errors.password} />
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="font-semibold text-emerald-700 hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  )
}
