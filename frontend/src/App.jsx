import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { useSelector } from 'react-redux'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Summary from './pages/Summary'
import About from './pages/About'
import Groups from './pages/Groups'

// ProtectedRoute is basically a wrapper. children = <Dashboard />
function ProtectedRoute({ children }) {
  const { user, token } = useSelector(state => state.auth)

  if (!user || !token) return <Navigate to="/login" replace />
  return children
  // replace means don’t add the protected route to browser history. Without replace, user could press back and go to the protected page again.
}

// layout with navbar — only for authenticated pages
function AuthLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Outlet />  {/* renders the child route */}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          {/* no navbar */}
          <Route path="/login" element={<Login />} />

          {/* authenticated routes — with navbar */}
          <Route element={<AuthLayout />}>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
            <Route path="/summary" element={<ProtectedRoute><Summary /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  )
}