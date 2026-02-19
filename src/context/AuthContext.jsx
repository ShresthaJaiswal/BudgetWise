import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  // useState: track user object and loading state
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // useEffect: on mount, rehydrate auth from localStorage (simulates token check)
  useEffect(() => {
    const savedUser = localStorage.getItem('budgetwise_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setAuthLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('budgetwise_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('budgetwise_user')
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
