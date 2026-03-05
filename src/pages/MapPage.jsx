import { useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePins } from '../hooks/usePins'
import MapView from '../components/Map/MapView'
import PinSidebar from '../components/Map/PinSidebar'
import Layout from '../components/Layout/Layout'

export default function MapPage() {
  const { user } = useAuth()
  const { pins, loading } = usePins(user?.uid)
  const mapViewRef = useRef()

  function handlePinSelect(pin) {
    // MapView handles flyTo internally via selectedPin state
    // We forward the selected pin to MapView
    if (mapViewRef.current) {
      mapViewRef.current.selectPin(pin)
    }
  }

  return (
    <Layout fullHeight>
      <div className="relative w-full h-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-bg animate-pulse" />
              <p className="text-ntz-light text-sm font-body">Loading your map...</p>
            </div>
          </div>
        ) : (
          <>
            <MapView pins={pins} isOwner={true} readOnly={false} />
            <PinSidebar pins={pins} onPinSelect={handlePinSelect} />
          </>
        )}
      </div>
    </Layout>
  )
}
