import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Share2, Map, Check } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  async function handleShare() {
    if (!user) return
    const url = `${window.location.origin}/map/${user.uid}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="h-14 bg-white/90 backdrop-blur-md border-b border-ntz-blue/20 flex items-center px-4 gap-3 z-[600] relative shadow-sm">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 mr-auto">
        <img src="/Logo.png" alt="Nun-Tzadik" className="h-8" />
        <span className="font-display font-bold text-ntz-dark text-base hidden sm:block">Nun-Tzadik</span>
      </Link>

      {user ? (
        <>
          <Link
            to="/map"
            className="flex items-center gap-1.5 text-sm font-medium font-body text-ntz-dark hover:text-ntz-dark/70 transition-colors px-3 py-1.5 rounded-lg hover:bg-ntz-blue/10"
          >
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">My Map</span>
          </Link>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex items-center gap-1.5 text-sm font-medium font-body btn-gradient text-white px-3.5 py-1.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="copied"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">Copied!</span>
                </motion.span>
              ) : (
                <motion.span
                  key="share"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share Map</span>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-semibold font-body shadow-sm flex-shrink-0">
            {(user.displayName || user.email || 'U')[0].toUpperCase()}
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-ntz-light hover:text-ntz-dark transition-colors p-1.5 rounded-lg hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </>
      ) : (
        <Link
          to="/auth"
          className="btn-gradient text-white text-sm font-semibold font-body px-4 py-1.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity"
        >
          Sign In
        </Link>
      )}
    </header>
  )
}
