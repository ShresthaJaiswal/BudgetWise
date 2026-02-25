import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // on mount, rehydrate auth from localStorage (simulating token check)
  useEffect(() => {
    const savedUser = localStorage.getItem('bw_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setAuthLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('bw_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('bw_user')
    localStorage.removeItem('bw_token')
  }

  return (
    <AuthContext.Provider value={{ user, authLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
