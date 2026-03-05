import { useAuth } from '../hooks/useAuth'
import { usePins } from '../hooks/usePins'
import MapView from '../components/Map/MapView'
import PinSidebar from '../components/Map/PinSidebar'
import Layout from '../components/Layout/Layout'

export default function MapPage() {
  const { user } = useAuth()
  const { pins, loading, error } = usePins(user?.uid)

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
        ) : error ? (
          <div className="flex items-center justify-center h-full px-6">
            <div className="bg-white rounded-2xl border border-red-100 shadow-ntz-card p-8 max-w-md text-center font-body">
              <p className="text-3xl mb-3">⚠️</p>
              <h2 className="font-display font-semibold text-ntz-dark text-lg mb-2">Could not load pins</h2>
              <p className="text-ntz-light text-sm mb-4 leading-relaxed">
                Firestore returned an error. This usually means your security rules are blocking reads,
                or a required index is missing.
              </p>
              <p className="text-xs text-ntz-light bg-gray-50 rounded-lg px-3 py-2 font-mono break-all">
                {error.message || String(error)}
              </p>
              <p className="text-xs text-ntz-light mt-3">
                Check the browser console for a direct link to create the missing index.
              </p>
            </div>
          </div>
        ) : (
          <>
            <MapView pins={pins} isOwner={true} readOnly={false} />
            <PinSidebar pins={pins} onPinSelect={() => {}} />
          </>
        )}
      </div>
    </Layout>
  )
}
