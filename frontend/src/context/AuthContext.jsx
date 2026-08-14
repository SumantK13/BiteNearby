import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [role, setRole] = useState(() => localStorage.getItem('role') || null)

  const login = (userData, token, userRole) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('role', userRole)
    setUser(userData)
    setRole(userRole)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    setUser(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}