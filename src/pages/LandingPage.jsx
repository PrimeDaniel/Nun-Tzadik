import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Share2, Star, Globe } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const features = [
  {
    icon: MapPin,
    emoji: '📍',
    title: 'Pin Your Favorites',
    desc: 'Click anywhere on the map and save the places that matter to you.',
  },
  {
    icon: Share2,
    emoji: '🔗',
    title: 'Share Instantly',
    desc: 'One link — anyone can view your map without signing in.',
  },
  {
    icon: Star,
    emoji: '✨',
    title: 'Rich Details',
    desc: 'Add photos, descriptions, links, and choose from 12 pin categories.',
  },
  {
    icon: Globe,
    emoji: '🗺️',
    title: 'Israel & Beyond',
    desc: 'Explore all 6 Israeli districts, or venture across the globe.',
  },
]

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-white font-body overflow-auto">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-bg opacity-20" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 30% 40%, rgba(217,223,255,0.5) 0%, transparent 55%), radial-gradient(ellipse at 70% 60%, rgba(255,196,209,0.5) 0%, transparent 55%)'
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: 'linear-gradient(to top, white, transparent)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10"
        >
          <div className="relative flex justify-center mb-10 w-full">
            {/* Glowing background behind logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [0.9, 1.05, 0.9],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-tr from-purple-400 via-pink-300 to-blue-400 rounded-full blur-[40px] opacity-50 z-0"
            />
            {/* Logo Image */}
            <motion.img
              initial={{ y: 0 }}
              animate={{ y: [-6, 6, -6] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              src="/nunheb.png"
              alt="Nun-Tzadik"
              className="h-28 relative z-10 drop-shadow-2xl"
            />
          </div>

          <h1 className="font-display font-bold text-5xl sm:text-6xl text-ntz-dark mb-4 leading-tight">
            Your map,{' '}
            <span className="gradient-text">your story.</span>
          </h1>

          <p className="text-ntz-light text-lg sm:text-xl max-w-lg mx-auto mb-10 leading-relaxed">
            Pin and share the places you love across Israel and the world.
            <br />
            <span className="text-ntz-dark font-medium">No clutter. Just your places.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link
              to={user ? '/map' : '/auth'}
              className="btn-gradient text-white font-semibold px-8 py-4 rounded-2xl shadow-ntz-pin hover:opacity-90 transition-opacity text-base"
            >
              {user ? 'Open My Map →' : 'Start Mapping — Free'}
            </Link>

            {!user && (
              <Link
                to="/auth"
                className="text-ntz-dark bg-white border border-ntz-blue/40 font-medium px-8 py-4 rounded-2xl hover:border-ntz-blue hover:bg-ntz-blue/5 transition-all text-base shadow-ntz-card"
              >
                Sign in
              </Link>
            )}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="bg-white border border-ntz-blue/20 rounded-2xl p-6 shadow-ntz-card hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="font-display font-semibold text-ntz-dark text-lg mb-1">{f.title}</h3>
              <p className="text-ntz-light text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="relative inline-block">
          <div className="absolute inset-0 gradient-bg rounded-3xl blur-2xl opacity-30 scale-110" />
          <div className="relative bg-white border border-ntz-blue/20 rounded-3xl px-12 py-10 shadow-ntz-card max-w-lg mx-auto">
            <p className="text-4xl mb-4">🇮🇱</p>
            <h2 className="font-display font-bold text-2xl text-ntz-dark mb-2">
              Explore Israel, district by district
            </h2>
            <p className="text-ntz-light text-sm mb-6">
              From the Galilee to the Negev — every region beautifully mapped.
            </p>
            <Link
              to={user ? '/map' : '/auth'}
              className="btn-gradient text-white font-semibold px-6 py-3 rounded-xl shadow-ntz-pin hover:opacity-90 transition-opacity inline-block"
            >
              {user ? 'View My Map' : 'Get Started'}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-ntz-light text-xs font-body">
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src="/nuntzadikheb.png" alt="" className="h-4 opacity-70 object-contain" />
        </div>
        <p>© {new Date().getFullYear()} Nun-Tzadik</p>
      </footer>
    </div>
  )
}
