import { useState, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, useMapEvents, Popup } from 'react-leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import IsraelProvinces from './IsraelProvinces'
import PinMarker from './PinMarker'
import PinPopup from './PinPopup'
import AddPinModal from './AddPinModal'
import { useAuth } from '../../hooks/useAuth'

// Handles map click events
function MapClickHandler({ onMapClick, isAdding }) {
  useMapEvents({
    click(e) {
      if (isAdding) {
        onMapClick(e.latlng)
      }
    },
    dblclick(e) {
      e.originalEvent.preventDefault()
      onMapClick(e.latlng)
    },
  })
  return null
}

export default function MapView({ pins, isOwner = true, readOnly = false }) {
  const { user } = useAuth()
  const [isAdding, setIsAdding] = useState(false)
  const [pendingLatlng, setPendingLatlng] = useState(null)
  const [selectedPin, setSelectedPin] = useState(null)
  const [editPin, setEditPin] = useState(null)
  const mapRef = useRef()

  const handleMapClick = useCallback((latlng) => {
    if (readOnly) return
    setPendingLatlng(latlng)
    setSelectedPin(null)
  }, [readOnly])

  function handlePinClick(pin) {
    setSelectedPin(pin)
    setPendingLatlng(null)
  }

  function handleModalClose() {
    setPendingLatlng(null)
    setEditPin(null)
    setIsAdding(false)
  }

  function handleSaved() {
    setPendingLatlng(null)
    setEditPin(null)
    setIsAdding(false)
  }

  function handleEdit(pin) {
    setSelectedPin(null)
    setEditPin(pin)
  }

  return (
    <div className="relative w-full h-full">
      {/* Map */}
      <MapContainer
        center={[31.5, 34.75]}
        zoom={8}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
        zoomControl={true}
        attributionControl={true}
        className={isAdding ? 'cursor-crosshair' : ''}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        <IsraelProvinces />
        <MapClickHandler onMapClick={handleMapClick} isAdding={isAdding || true} />

        {pins.map((pin) => (
          <PinMarker
            key={pin.id}
            pin={pin}
            onClick={handlePinClick}
          />
        ))}
      </MapContainer>

      {/* Add pin button (owners only) */}
      {!readOnly && (
        <div className="absolute bottom-8 right-4 z-[500]">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-ntz-pin text-sm font-medium font-body transition-all ${
              isAdding
                ? 'bg-ntz-dark text-white'
                : 'btn-gradient text-white font-semibold'
            }`}
          >
            <Plus className={`w-4 h-4 transition-transform ${isAdding ? 'rotate-45' : ''}`} />
            {isAdding ? 'Click map to place pin' : 'Add Pin'}
          </motion.button>
        </div>
      )}

      {/* Click to add hint */}
      <AnimatePresence>
        {isAdding && !pendingLatlng && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[500] bg-ntz-dark/80 text-white text-xs font-body px-4 py-2 rounded-full backdrop-blur-sm pointer-events-none"
          >
            Click anywhere on the map to place your pin
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pin popup (selected pin) */}
      <AnimatePresence>
        {selectedPin && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
            <div className="pointer-events-auto">
              <PinPopup
                pin={selectedPin}
                isOwner={isOwner && user?.uid === selectedPin.userId}
                onEdit={handleEdit}
                onClose={() => setSelectedPin(null)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit modal */}
      {(pendingLatlng || editPin) && (
        <AddPinModal
          latlng={pendingLatlng}
          editPin={editPin}
          onClose={handleModalClose}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
