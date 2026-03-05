import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, Chrome } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function AuthPage() {
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(email, password)
      } else {
        if (!displayName.trim()) { setError('Please enter your name'); setLoading(false); return }
        await register(email, password, displayName.trim())
      }
      navigate('/map')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      navigate('/map')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  function friendlyError(code) {
    const map = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/popup-blocked': 'Popup was blocked by your browser. Please allow popups for this site and try again.',
      'auth/popup-closed-by-user': 'Sign-in window was closed. Please try again.',
      'auth/operation-not-allowed': 'Google sign-in is not enabled. Please enable it in your Firebase Console → Authentication → Sign-in methods.',
      'auth/cancelled-popup-request': 'Only one sign-in popup at a time. Please try again.',
      'auth/network-request-failed': 'Network error — check your internet connection.',
      'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    }
    return map[code] || `Sign-in failed (${code || 'unknown error'}). Please try again.`
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 gradient-bg opacity-30" />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 20% 50%, rgba(217,223,255,0.4) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(255,196,209,0.4) 0%, transparent 60%)'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/">
            <img src="/Logo.png" alt="Nun-Tzadik" className="h-16 mx-auto mb-3 drop-shadow-sm" />
          </a>
          <h1 className="font-display text-2xl font-bold text-ntz-dark">
            {tab === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-ntz-light text-sm mt-1 font-body">
            {tab === 'login' ? 'Sign in to manage your pins' : 'Start pinning your favorite places'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-ntz-card border border-ntz-blue/40 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-4 text-sm font-medium font-body transition-colors ${
                  tab === t
                    ? 'text-ntz-dark border-b-2 border-ntz-pink'
                    : 'text-ntz-light hover:text-ntz-dark'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Google button */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 text-ntz-dark text-sm font-medium font-body hover:bg-gray-50 hover:border-ntz-blue transition-all mb-6 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-ntz-light text-xs font-body">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {tab === 'register' && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-xs font-medium text-ntz-dark mb-1.5 font-body">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ntz-light" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-ntz-blue focus:ring-2 focus:ring-ntz-blue/20 outline-none text-sm font-body text-ntz-dark placeholder:text-ntz-light transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-xs font-medium text-ntz-dark mb-1.5 font-body">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ntz-light" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-ntz-blue focus:ring-2 focus:ring-ntz-blue/20 outline-none text-sm font-body text-ntz-dark placeholder:text-ntz-light transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ntz-dark mb-1.5 font-body">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ntz-light" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:border-ntz-blue focus:ring-2 focus:ring-ntz-blue/20 outline-none text-sm font-body text-ntz-dark placeholder:text-ntz-light transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ntz-light hover:text-ntz-dark transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs font-body bg-red-50 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gradient text-white font-semibold font-body py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-60 shadow-ntz-pin mt-2"
              >
                {loading ? 'Please wait...' : (tab === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-ntz-light font-body mt-6">
          By continuing, you agree to our terms and privacy policy.
        </p>
      </motion.div>
    </div>
  )
}
