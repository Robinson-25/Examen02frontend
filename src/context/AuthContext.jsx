import { createContext, useContext, useState } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))

  const login = async (username, password) => {
    const { data } = await api.post('/auth/signin', { username, password })
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
  }

  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  const roles = user?.roles || []
  const value = {
    user,
    login,
    logout,
    isAdmin: roles.includes('admin'),
    // El administrador también puede hacer todo lo del moderador
    isModerator: roles.includes('moderator') || roles.includes('admin'),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
