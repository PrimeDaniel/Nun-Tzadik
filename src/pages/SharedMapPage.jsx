import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Share2, Check, ArrowLeft } from 'lucide-react'
import { usePins } from '../hooks/usePins'
import { getUserProfile } from '../lib/firestore'
import MapView from '../components/Map/MapView'
import PinSidebar from '../components/Map/PinSidebar'

export default function SharedMapPage() {
  const { userId } = useParams()
  const { pins, loading } = usePins(userId)
  const [ownerProfile, setOwnerProfile] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (userId) {
      getUserProfile(userId).then(setOwnerProfile)
    }
  }, [userId])

  async function handleShare() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-screen flex flex-col bg-white font-body overflow-hidden">
      {/* Shared map header */}
      <header className="h-14 bg-white/90 backdrop-blur-md border-b border-ntz-blue/20 flex flex-row-reverse items-center px-4 gap-3 z-[600] relative shadow-sm flex-shrink-0">
        <Link to="/" className="flex flex-row-reverse items-center gap-2">
          <img src="/nunheb.png" alt="Nun-Tzadik" className="h-8" />
        </Link>

        <div className="flex-1 min-w-0 mr-2 text-right">
          {ownerProfile ? (
            <div>
              <p className="text-xs text-ntz-light font-body">Viewing map by</p>
              <p className="font-display font-semibold text-ntz-dark text-sm truncate">
                {ownerProfile.displayName || 'Anonymous'}
              </p>
            </div>
          ) : (
            <div className="h-8 w-32 bg-gray-100 rounded animate-pulse ml-auto" />
          )}
        </div>

        <div className="flex flex-row-reverse items-center gap-2">
          <span className="text-xs text-ntz-light font-body hidden sm:block text-right">
            {pins.length} pin{pins.length !== 1 ? 's' : ''}
          </span>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex flex-row-reverse items-center gap-1.5 btn-gradient text-white text-sm font-semibold px-3.5 py-1.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
          </motion.button>

          <Link
            to="/auth"
            className="text-sm font-medium font-body text-ntz-dark border border-ntz-blue/30 px-3 py-1.5 rounded-lg hover:bg-ntz-blue/10 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Map area */}
      <div className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-bg animate-pulse" />
              <p className="text-ntz-light text-sm font-body">Loading map...</p>
            </div>
          </div>
        ) : (
          <>
            <MapView pins={pins} isOwner={false} readOnly={true} />
            <PinSidebar pins={pins} onPinSelect={() => { }} />
          </>
        )}
      </div>
    </div>
  )
}
