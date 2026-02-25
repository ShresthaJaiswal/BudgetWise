import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Summary from './pages/Summary'
import About from './pages/About'

function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

function AppLayout() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen">
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/summary"
          element={
            <ProtectedRoute>
              <Summary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

// Context Providers wrap everything
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
