import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { useSelector } from 'react-redux'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Summary from './pages/Summary'
import About from './pages/About'

// ProtectedRoute is basically a wrapper. children = <Dashboard />
function ProtectedRoute({ children }) {
  const user = useSelector(state => state.auth)

  return user ? children : <Navigate to="/login" replace />
  // replace means don’t add the protected route to browser history. Without replace, user could press back and go to the protected page again.
}

function AppLayout() {
  const user = useSelector(state => state.auth)
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
        <AppLayout />
      </ThemeProvider>
    </BrowserRouter>
  )
}
