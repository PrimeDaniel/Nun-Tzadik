import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List, X, MapPin, ChevronRight } from 'lucide-react'
import { getCategoryById } from './pinIcons'

// Short display names for the district filter buttons
const DISTRICT_LABELS = {
  HaZafon:   'North',
  Haifa:     'Haifa',
  HaMerkaz:  'Central',
  TelAviv:   'Tel Aviv',
  Jerusalem: 'Jerusalem',
  HaDarom:   'South',
  Golan:     'Golan',
}

function PinCard({ pin, onClick }) {
  const category = getCategoryById(pin.iconType)
  const dotColor = pin.pinColor || '#7B8EF5'

  return (
    <motion.button
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: -2 }}
      onClick={() => onClick(pin)}
      className="w-full text-left flex items-start gap-3 p-3 rounded-xl hover:bg-ntz-blue/10 transition-colors group border border-transparent hover:border-ntz-blue/20"
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 shadow-sm"
        style={{ background: dotColor }}
      >
        {category.emoji}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-ntz-dark text-sm truncate font-body">{pin.title}</p>
        {pin.description && (
          <p className="text-ntz-light text-xs mt-0.5 line-clamp-2 font-body">{pin.description}</p>
        )}
        <p className="text-ntz-light/70 text-xs mt-1 font-body">{category.label}</p>
      </div>

      <ChevronRight className="w-4 h-4 text-ntz-light group-hover:text-ntz-dark transition-colors flex-shrink-0 mt-2" />
    </motion.button>
  )
}

export default function PinSidebar({ pins, allPinsCount, districts, selectedDistrict, onDistrictChange, onPinSelect }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const districtNames = districts
    ? districts.features.map(f => f.properties.NAME_1).filter(n => DISTRICT_LABELS[n])
    : []

  const filtered = pins.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      {/* Toggle button */}
      <div className="absolute top-4 right-4 z-[500]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-white text-ntz-dark px-3.5 py-2.5 rounded-xl shadow-ntz-card border border-ntz-blue/30 text-sm font-medium font-body hover:border-ntz-blue transition-colors"
        >
          {open ? <X className="w-4 h-4" /> : <List className="w-4 h-4" />}
          <span>{open ? 'Close' : `Pins (${allPinsCount ?? pins.length})`}</span>
        </motion.button>
      </div>

      {/* Sidebar panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 320 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 320 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute top-0 right-0 h-full w-80 z-[499] bg-white/95 backdrop-blur-md border-l border-ntz-blue/20 shadow-2xl flex flex-col font-body"
          >
            {/* Header */}
            <div className="gradient-bg px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white" />
                  <h2 className="font-display font-semibold text-white text-base">My Pins</h2>
                </div>
                <span className="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {pins.length}
                </span>
              </div>
              {/* Search */}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pins..."
                className="w-full bg-white/20 text-white placeholder:text-white/70 text-sm px-3 py-2 rounded-xl border border-white/20 outline-none focus:bg-white/30 transition-colors"
              />
            </div>

            {/* District filter */}
            {districtNames.length > 0 && (
              <div className="px-3 py-2 border-b border-ntz-blue/10 flex gap-1.5 flex-wrap">
                <button
                  onClick={() => onDistrictChange(null)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    !selectedDistrict ? 'btn-gradient text-white shadow-sm' : 'bg-gray-100 text-ntz-dark hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {districtNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => onDistrictChange(selectedDistrict === name ? null : name)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedDistrict === name ? 'btn-gradient text-white shadow-sm' : 'bg-gray-100 text-ntz-dark hover:bg-gray-200'
                    }`}
                  >
                    {DISTRICT_LABELS[name]}
                  </button>
                ))}
              </div>
            )}

            {/* Pin list */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📍</div>
                  <p className="text-ntz-light text-sm">
                    {pins.length === 0 ? 'No pins yet. Click the map to add one!' : 'No matching pins.'}
                  </p>
                </div>
              ) : (
                filtered.map((pin) => (
                  <PinCard
                    key={pin.id}
                    pin={pin}
                    onClick={(p) => onPinSelect(p)}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
