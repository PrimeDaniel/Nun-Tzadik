import { useState, useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, useMapEvents, Marker, useMap } from 'react-leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, LocateFixed, Loader2 } from 'lucide-react'
import L from 'leaflet'
import IsraelProvinces from './IsraelProvinces'
import CityMarkers from './CityMarkers'
import PinMarker from './PinMarker'
import PinPopup from './PinPopup'
import AddPinModal from './AddPinModal'
import { useAuth } from '../../hooks/useAuth'

// Handles map click for placing pins
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng)
    },
  })
  return null
}

// Flies map to location when it changes, renders the "you are here" marker
const locationIcon = L.divIcon({
  html: `<div class="location-dot">
    <div class="location-pulse"></div>
    <div class="location-center"></div>
  </div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

function UserLocationMarker({ location }) {
  const map = useMap()

  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], Math.max(map.getZoom(), 13), { duration: 1.5 })
    }
  }, [location, map])

  if (!location) return null

  return <Marker position={[location.lat, location.lng]} icon={locationIcon} zIndexOffset={1000} />
}

export default function MapView({ pins, isOwner = true, readOnly = false }) {
  const { user } = useAuth()
  const [isAdding, setIsAdding] = useState(false)
  const [pendingLatlng, setPendingLatlng] = useState(null)
  const [selectedPin, setSelectedPin] = useState(null)
  const [editPin, setEditPin] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [locating, setLocating] = useState(false)

  const handleMapClick = useCallback((latlng) => {
    if (readOnly || !isAdding) return
    setPendingLatlng(latlng)
    setSelectedPin(null)
  }, [readOnly, isAdding])

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

  function handleLocate() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      (err) => {
        console.warn('Geolocation error:', err.message)
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[31.5, 34.75]}
        zoom={8}
        style={{ width: '100%', height: '100%' }}
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
        <CityMarkers />

        <MapClickHandler onMapClick={handleMapClick} />

        {pins.map((pin) => (
          <PinMarker key={pin.id} pin={pin} onClick={handlePinClick} />
        ))}

        <UserLocationMarker location={userLocation} />
      </MapContainer>

      {/* Bottom-right controls */}
      <div className="absolute bottom-8 right-4 z-[500] flex flex-col gap-2 items-end">
        {/* Find my location */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLocate}
          disabled={locating}
          title="Show my location"
          className="flex items-center justify-center w-11 h-11 bg-white rounded-xl shadow-ntz-card border border-ntz-blue/40 hover:border-ntz-blue transition-colors disabled:opacity-60"
        >
          {locating
            ? <Loader2 className="w-5 h-5 text-ntz-dark animate-spin" />
            : <LocateFixed className={`w-5 h-5 transition-colors ${userLocation ? 'text-blue-500' : 'text-ntz-dark'}`} />
          }
        </motion.button>

        {/* Add pin (owner only) */}
        {!readOnly && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-ntz-pin text-sm font-semibold font-body transition-all ${
              isAdding ? 'bg-ntz-dark text-white' : 'btn-gradient text-white'
            }`}
          >
            <Plus className={`w-4 h-4 transition-transform ${isAdding ? 'rotate-45' : ''}`} />
            {isAdding ? 'Click map to place pin' : 'Add Pin'}
          </motion.button>
        )}
      </div>

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

      {/* Pin popup */}
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
