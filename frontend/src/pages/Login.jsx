import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'
import { useLoginMutation, useRegisterMutation, useForgotPasswordMutation, useVerifyOtpMutation, useResetPasswordMutation } from '../store/api'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '../store/slices/authSlice'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

export default function Login() {
  const user = useSelector(state => state.auth.user)
  // state.auth returns { user: {...}, token: '...' } — the whole slice. state.auth.user returns just { name, email, id, currency } which is what user?.name expects.

  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const dispatch = useDispatch()

  // RTK Query mutations — isLoading replaces manual setLoading
  const [loginApi, { isLoading: loginLoading }] = useLoginMutation()
  const [registerApi, { isLoading: registerLoading }] = useRegisterMutation()
  const [forgotPassword, { isLoading: forgotLoading }] = useForgotPasswordMutation()
  const [verifyOtp, { isLoading: verifyLoading }] = useVerifyOtpMutation()
  const [resetPassword, { isLoading: resetLoading }] = useResetPasswordMutation()


  // step controls which form is shown
  // 'login' | 'register' | 'forgot' | 'verify-otp' | 'reset-password'
  const [step, setStep] = useState('login')

  // login + register fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [currency, setCurrency] = useState('INR')

  // forgot password fields
  const [resetEmail, setResetEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [noAccount, setNoAccount] = useState(false)

  // feedback
  const [quote, setQuote] = useState(null)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // toasts and pop-ups
  const { toasts, addToast, removeToast } = useToast()

  // useRef: auto-focus email input on mount
  const emailRef = useRef(null)
  const nameRef = useRef(null)

  // redirect if already logged in
  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  useEffect(() => {
    nameRef.current?.focus()

    const fetchQuote = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/quote')
        setQuote({ text: res.data.text, author: res.data.author })
      } catch (err) {
        // Fallback quote if API is unavailable
        setQuote({
          text: 'A budget is telling your money where to go instead of wondering where it went.',
          author: 'Dave Ramsey',
        })
      }
    }
    fetchQuote()
  }, [])

  // helper to switch steps cleanly
  const goToStep = (newStep) => {
    setStep(newStep)
    setError('')
    setSuccessMsg('')
    setNoAccount(false) // reset on every step change
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    if (!email.trim()) return setError('Please enter your email.')
    if (!emailRegex.test(email)) return setError('Please enter a valid email address.')
    if (step === 'register' && !name.trim()) return setError('Please enter your name.')
    if (!password.trim()) return setError('Please enter a password.')

    setError('')  // clear any previous error before making the request

    try {
      if (step === 'register') {
        // Register flow
        const res = await registerApi({ name: name.trim(), email, phone: phone || undefined, password, currency }).unwrap()
        dispatch(setUser({
          token: res.accessToken, // change res.token to res.accessToken
          user: {
            name: res.user.name,
            email: res.user.email,
            phone: res.user.phone,
            id: res.user.id,
            currency: res.user.currency
          }
        }))
        addToast('Account created successfully! Welcome 🎉', 'success')
      } else {
        // Login flow
        const res = await loginApi({ email, password }).unwrap()
        dispatch(setUser({
          token: res.accessToken,
          user: {
            name: res.user.name,
            email: res.user.email,
            id: res.user.id,
            currency: res.user.currency
          }
        }))
      }
      navigate('/dashboard')

    } catch (err) {
      if (err.status === 429) {
        addToast('Too many attempts. Please try again later.', 'warn')
      } else {
        addToast(err.data?.message || 'Something went wrong.', 'error')
      }
    }
  }

  const isLoading = loginLoading || registerLoading

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!resetEmail.trim()) return setError('Please enter your email.')
    setError('')
    try {
      await forgotPassword({ email: resetEmail }).unwrap()
      goToStep('verify-otp')
    } catch (err) {
      if (err.status === 429) {
        addToast('Too many attempts. Please try again later.', 'warn')
      } else {
        addToast(err.data?.message || 'Something went wrong.', 'error')
      }
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp.trim()) return setError('Please enter the OTP.')
    if (otp.length !== 6) return setError('OTP must be 6 digits.')
    setError('')
    try {
      await verifyOtp({ email: resetEmail, otp }).unwrap()
      goToStep('reset-password')
    } catch (err) {
      setError(err.data?.message || 'Invalid OTP.')
      setOtp('')
      if (err.data?.redirect === 'forgot') {
        setNoAccount(true)  // show register/login options instead of resend
        addToast('No account found with this email. Please register or use another email.', 'warn')
      }
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!newPassword.trim()) return setError('Please enter a new password.')
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.')
    if (newPassword !== confirmPassword) return setError('Passwords do not match.')
    setError('')
    try {
      await resetPassword({
        email: resetEmail,
        otp,
        newPassword,
      }).unwrap()

      // clear fields
      setOtp('')
      setNewPassword('')
      setConfirmPassword('')
      setResetEmail('')

      setTimeout(() => {
        goToStep('login')
        addToast('Password Reset Successfully! Please sign in.', 'success')
      }, 5000)

    } catch (err) {
      setError(err?.data?.message || 'Something went wrong.')
      setNewPassword('')  // clear on failure
      setConfirmPassword('')
      if(err.data?.redirect === 'forgot') {
        setTimeout(() => {goToStep('forgot')}, 3000)
      }
    }
  }

  // Dynamic heading per step
  const headings = {
    login: 'Welcome Back',
    register: 'Create Account',
    forgot: 'Forgot Password',
    'verify-otp': 'Enter OTP',
    'reset-password': 'Reset Password',
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950">

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
        {isDark ? '☀️' : '🌙'}
      </button>

      <div className="w-full max-w-sm animate-fade-in">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💰</div>
          <h1 className="font-display font-bold text-3xl text-slate-800 dark:text-white mb-1">
            BudgetWise
          </h1>
          <p className="text-slate-400 text-sm">Your personal finance tracker</p>
        </div>

        {/* Quote — only shown on login and register steps */}
        {quote && (step === 'login' || step === 'register') && (
          <div className="card p-4 mb-6 border-l-4 border-l-emerald-500 animate-slide-in">
            <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
              "{quote.text}"
            </p>
            <p className="text-xs text-slate-400 mt-2 text-right">— {quote.author}</p>
          </div>
        )}

        <div className="card p-6">

          {/* Dynamic heading */}
          <h2 className="font-display font-semibold text-lg mb-5 text-slate-800 dark:text-slate-100">
            {headings[step]}
          </h2>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg mb-4">
              {error}
            </p>
          )}

          {/* Success message — shown on login step after successful reset */}
          {successMsg && step === 'login' && (
            <p className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg mb-4">
              {successMsg}
            </p>
          )}

          {/* ── LOGIN FORM ──────────────────────────────────────────────────── */}
          {step === 'login' && (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Your Email
                </label>
                <input
                  ref={emailRef}
                  type="email"
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

              {/* Forgot password link — login only */}
              <p className="text-right mb-3">
                <button
                  type="button"
                  onClick={() => { goToStep('forgot'); setOtp('') }}
                  className="text-xs text-emerald-500 hover:text-emerald-600">
                  Forgot password?
                </button>
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-70">
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</>
                ) : 'Sign In →'}
              </button>

              <p className="text-center text-xs text-slate-400 mt-4">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => goToStep('register')}
                  className="text-emerald-500 hover:text-emerald-600 font-medium">
                  Register
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ───────────────────────────────────────────────── */}
          {step === 'register' && (
            <form onSubmit={handleSubmit}>

              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Arjun Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Your Email
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="e.g. xyz123@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Your Phone (optional)
                </label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="e.g. +919876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
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

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-70">
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</>
                ) : 'Create Account →'}
              </button>

              <p className="text-center text-xs text-slate-400 mt-4">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => goToStep('login')}
                  className="text-emerald-500 hover:text-emerald-600 font-medium">
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* ── FORGOT PASSWORD FORM ────────────────────────────────────────── */}
          {step === 'forgot' && (
            <form onSubmit={handleForgotPassword}>
              <p className="text-xs text-slate-400 mb-4">
                Enter your registered email and we'll send you an OTP.
              </p>
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Registered Email
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="e.g. xyz123@gmail.com"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-70">
                {forgotLoading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending OTP...</>
                ) : 'Send OTP →'}
              </button>

              <p className="text-center text-xs text-slate-400 mt-4">
                <button
                  type="button"
                  onClick={() => goToStep('login')}
                  className="text-emerald-500 hover:text-emerald-600">
                  Back to login
                </button>
              </p>
            </form>
          )}

          {/* ── VERIFY OTP FORM ─────────────────────────────────────────────── */}
          {step === 'verify-otp' && (
            <form onSubmit={handleVerifyOtp}>
              <p className="text-xs text-slate-400 mb-4">
                OTP sent to <span className="text-emerald-500">{resetEmail}</span>. Check your inbox.
              </p>
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  className="input-field tracking-widest text-left text-lg font-mono"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                {/* .replace(/\D/g, '') only allows digits */}
              </div>

              <button
                type="submit"
                disabled={verifyLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-70">
                {verifyLoading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</>
                ) : 'Verify OTP →'}
              </button>

              {/* conditionally show different footer based on noAccount */}
              {noAccount ? (
                <div className="text-center text-xs text-slate-400 mt-4 space-y-2">
                  <p>
                    <button
                      type="button"
                      onClick={() => { goToStep('register'); setEmail(resetEmail) }}  // prefill email
                      className="text-emerald-500 hover:text-emerald-600 font-medium">
                      Register with this email
                    </button>
                  </p>
                  <p>
                    or{' '}
                    <button
                      type="button"
                      onClick={() => { goToStep('forgot'); setOtp('') }}
                      className="text-emerald-500 hover:text-emerald-600">
                      Login with another email
                    </button>
                  </p>
                </div>
              ) : (
                <p className="text-center text-xs text-slate-400 mt-4">
                  Didn't receive it?{' '}
                  <button
                    type="button"
                    onClick={() => { goToStep('forgot'); setOtp('') }}
                    className="text-emerald-500 hover:text-emerald-600">
                    Resend OTP
                  </button>
                </p>
              )}
            </form>
          )}

          {/* ── RESET PASSWORD FORM ─────────────────────────────────────────── */}
          {step === 'reset-password' && (
            <form onSubmit={handleResetPassword}>
              <p className="text-xs text-slate-400 mb-4">
                OTP verified. Enter your new password below.
              </p>
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />

                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mt-3 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-70">
                {resetLoading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Resetting...</>
                ) : 'Reset Password →'}
              </button>
            </form>
          )}

        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Your data is securely stored in the cloud
        </p>
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
