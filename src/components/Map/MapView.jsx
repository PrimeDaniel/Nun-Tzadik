import { useState, useCallback, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMapEvents, Marker, useMap } from 'react-leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, LocateFixed, Loader2, Layers } from 'lucide-react'
import L from 'leaflet'
import IsraelProvinces from './IsraelProvinces'
import CityMarkers from './CityMarkers'
import PinMarker from './PinMarker'
import PinPopup from './PinPopup'
import AddPinModal from './AddPinModal'
import AddGroupModal from './AddGroupModal'
import { useAuth } from '../../hooks/useAuth'

// Handles map click for placing pins, with support for touch-and-hold precise dragging
function MapAddPinInteraction({ isAdding, onPinPlaced }) {
  const map = useMap()
  const [dragMarker, setDragMarker] = useState(null)

  const timerRef = useRef()
  const dragRef = useRef(false)
  const ignoreClick = useRef(false)

  // Floating pin icon, offset diagonally from touch point so finger doesn't obscure the placement point
  const dragIcon = L.divIcon({
    html: `
      <div style="position:relative;width:44px;height:52px;opacity:0.95;">
        <div style="
          width:40px;height:40px;
          border-radius:50%;
          background:#7B8EF5;
          border:3px solid white;
          box-shadow:0 4px 12px rgba(0,0,0,0.35);
          display:flex;align-items:center;justify-content:center;
          font-size:20px;line-height:1;user-select:none;
          margin:0 auto;
        ">📍</div>
        <div style="
          width:12px;height:10px;
          background:#7B8EF5;
          clip-path:polygon(50% 100%,0% 0%,100% 0%);
          margin:0 auto;
        "></div>
      </div>
    `,
    className: '',
    iconSize: [44, 52],
    iconAnchor: [22, 52], // Tip of the pin
  })

  // Returns latlng offset (above and to left) of finger pixel so user can precisely see the tip
  const getOffsetLatLng = (e) => {
    if (!e.containerPoint) return e.latlng
    const point = e.containerPoint.clone()
    point.y -= 70 // Up by 70px
    point.x -= 30 // Left by 30px
    return map.containerPointToLatLng(point)
  }

  useMapEvents({
    mousedown(e) {
      if (!isAdding) return
      ignoreClick.current = false
      timerRef.current = setTimeout(() => {
        dragRef.current = true
        map.dragging.disable()
        setDragMarker(getOffsetLatLng(e))
      }, 350)
    },
    mousemove(e) {
      if (dragRef.current) {
        setDragMarker(getOffsetLatLng(e))
      }
    },
    mouseup(e) {
      clearTimeout(timerRef.current)
      if (dragRef.current) {
        dragRef.current = false
        ignoreClick.current = true
        map.dragging.enable()
        const finalPos = dragMarker || getOffsetLatLng(e)
        setDragMarker(null)
        // Delay resetting ignoreClick so the immediate click event afterwards is captured
        setTimeout(() => { ignoreClick.current = false }, 100)
        onPinPlaced(finalPos)
      }
    },
    dragstart() {
      // Clear timer if user starts panning map quickly
      clearTimeout(timerRef.current)
    },
    click(e) {
      if (!isAdding || ignoreClick.current) return
      onPinPlaced(e.latlng)
    }
  })

  return dragMarker ? (
    <Marker position={dragMarker} icon={dragIcon} zIndexOffset={9999} interactive={false} />
  ) : null
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

// Flies to an externally-selected pin (from sidebar) and reveals its popup
function FlyToPin({ pin, onReady }) {
  const map = useMap()

  useEffect(() => {
    if (!pin) return
    map.flyTo([pin.lat, pin.lng], Math.max(map.getZoom(), 14), { duration: 1.2 })
    onReady(pin)
  }, [pin]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

export default function MapView({ pins, isOwner = true, readOnly = false, externalPin, viewerUser }) {
  const { user } = useAuth()
  const [isAdding, setIsAdding] = useState(false)
  const [pendingLatlng, setPendingLatlng] = useState(null)
  const [selectedPin, setSelectedPin] = useState(null)
  const [editPin, setEditPin] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const [groupModalOpen, setGroupModalOpen] = useState(false)

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

        <MapAddPinInteraction isAdding={isAdding} onPinPlaced={handleMapClick} />

        {pins.map((pin) => (
          <PinMarker key={pin.id} pin={pin} onClick={handlePinClick} />
        ))}

        <UserLocationMarker location={userLocation} />
        <FlyToPin key={externalPin?.id + '_' + externalPin?.lat} pin={externalPin} onReady={(pin) => { setSelectedPin(pin); setPendingLatlng(null) }} />
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

        {/* Add pin / Create group (owner only) */}
        {!readOnly && (
          <>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAdding(!isAdding)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold font-body transition-all ${isAdding
                ? 'bg-ntz-dark text-white shadow-ntz-pin'
                : 'bg-[#76B7F2] text-white shadow-[0_0_16px_rgba(118,183,242,0.6)] hover:shadow-[0_0_24px_rgba(118,183,242,0.8)] hover:bg-[#68a8e3]'
                }`}
            >
              <Plus className={`w-4 h-4 transition-transform ${isAdding ? 'rotate-45' : ''}`} />
              {isAdding ? 'Place your pin' : 'Add Pin'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGroupModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-ntz-card text-white text-sm font-semibold font-body btn-gradient hover:opacity-90 transition-opacity"
            >
              <Layers className="w-4 h-4" />
              Create Group
            </motion.button>


          </>
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
                viewerUser={viewerUser}
                onEdit={handleEdit}
                onClose={() => setSelectedPin(null)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit pin modal */}
      {(pendingLatlng || editPin) && (
        <AddPinModal
          latlng={pendingLatlng}
          editPin={editPin}
          onClose={handleModalClose}
          onSaved={handleSaved}
        />
      )}

      {/* Create group modal */}
      {groupModalOpen && (
        <AddGroupModal
          onClose={() => setGroupModalOpen(false)}
          onSaved={() => setGroupModalOpen(false)}
        />
      )}
    </div>
  )
}
