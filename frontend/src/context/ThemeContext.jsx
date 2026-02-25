import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // initialize from localStorage, fallback to system preference
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('bw_theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // sync dark class on <html> and persist to localStorage
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('bw_theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => setIsDark(prev => !prev)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
