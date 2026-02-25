import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useLoginMutation, useRegisterMutation } from '../store/api'

export default function Login() {
  const { login, user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  // RTK Query mutations — isLoading replaces manual setLoading
  const [loginApi, { isLoading: loginLoading }] = useLoginMutation()
  const [registerApi, { isLoading: registerLoading }] = useRegisterMutation()

  // Two-way binding state
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [quote, setQuote] = useState(null)
  const [error, setError] = useState('')

  // auto-focus name input on mount
  const nameRef = useRef(null)

  // redirect if already logged in
  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  useEffect(() => {
    nameRef.current?.focus()

    const fetchQuote = async () => {
      try {
        const res = await axios.get(
          'https://api.quotable.io/random?tags=success|motivational&maxLength=120'
        )
        setQuote({ text: res.data.content, author: res.data.author })
      } catch {
        // Fallback quote if API is unavailable
        setQuote({
          text: 'A budget is telling your money where to go instead of wondering where it went.',
          author: 'Dave Ramsey',
        })
      }
    }
    fetchQuote()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!email.trim()) return setError('Please enter your email.')
    if (!password.trim()) return setError('Please enter a password.')

    setError('')  // ← clear any previous error before making the request

    try {
      if (isRegisterMode) {
        // Register flow
        const res = await registerApi({ name: name.trim(), email, password, currency }).unwrap()
        localStorage.setItem('bw_token', res.token)
        login({ name: res.user.name, email: res.user.email, id: res.user.id, currency: res.user.currency })
      } else {
        // Login flow
        const res = await loginApi({ email, password }).unwrap()
        localStorage.setItem('bw_token', res.token)
        login({ name: res.user.name, email: res.user.email, id: res.user.id, currency: res.user.currency })
      }
      navigate('/dashboard')

    } catch (err) {
      setError(err.data?.message || 'Something went wrong. Please try again.')
    }
  }

  const isLoading = loginLoading || registerLoading

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
        {isDark ? '☀️' : '🌙'}
      </button>

      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💰</div>
          <h1 className="font-display font-bold text-3xl text-slate-800 dark:text-white mb-1">
            BudgetWise
          </h1>
          <p className="text-slate-400 text-sm">Your personal finance tracker</p>
        </div>

        {/* Quote fetched via axios */}
        {quote && (
          <div className="card p-4 mb-6 border-l-4 border-l-emerald-500 animate-slide-in">
            <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
              "{quote.text}"
            </p>
            <p className="text-xs text-slate-400 mt-2 text-right">— {quote.author}</p>
          </div>
        )}

        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg mb-5 text-slate-800 dark:text-slate-100">
            {isRegisterMode ? 'Create Account' : 'Welcome Back'}
          </h2>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg mb-4">
              {error}
            </p>
          )}

          {/* Name — only shown on register */}
          {isRegisterMode && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Your Name
              </label>
              <input
                ref={nameRef}
                type="text"
                className="input-field"
                placeholder="e.g. Arjun Sharma"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email — two-way binding + useRef */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Your Email
              </label>
              <input
                ref={nameRef}
                type="text"
                className="input-field"
                placeholder="e.g. xyz123@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {isRegisterMode && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Preferred Currency
                </label>
                <select
                  className="input-field"
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}>
                  <option value="INR">🇮🇳 Indian Rupee (₹)</option>
                  <option value="USD">🇺🇸 US Dollar ($)</option>
                  <option value="EUR">🇪🇺 Euro (€)</option>
                  <option value="GBP">🇬🇧 British Pound (£)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-70 mt-2">
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isRegisterMode ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                isRegisterMode ? 'Create Account →' : 'Sign In →'
              )}
            </button>
          </form>

          {/* Toggle between login and register */}
          <p className="text-center text-xs text-slate-400 mt-4">
            {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsRegisterMode(p => !p); setError('') }}
              className="text-emerald-500 hover:text-emerald-600 font-medium">
              {isRegisterMode ? 'Sign in' : 'Register'}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Your data is securely stored in the cloud
        </p>
      </div>
    </div>
  )
}
