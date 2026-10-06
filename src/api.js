import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
})

// Envía el JWT en cada petición
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (user?.accessToken) config.headers.Authorization = `Bearer ${user.accessToken}`
  return config
})

// Si el token expiró o es inválido, se cierra la sesión
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isAuthRoute = error.config?.url?.startsWith('/auth/')
    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('user')
      window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)

// Mensaje legible para mostrar al usuario
export const errorMessage = (error) =>
  error.response?.data?.message || 'No se pudo conectar con el servidor'

export default api
