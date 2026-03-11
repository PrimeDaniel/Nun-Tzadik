import React, { useState } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Navigation, Map, Copy, Check } from 'lucide-react'
import { addPin } from '../../lib/firestore'
import { useAuth } from '../../hooks/useAuth'

export default function CoffeeCartMarker({ cart }) {
    const { user } = useAuth()
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const cartIcon = L.divIcon({
        html: `
      <div style="
        width: 38px; height: 38px;
        background: #FFF;
        border: 2px solid #FF8C42;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
        animation: pulseCart 2s infinite ease-in-out;
      ">
        ${cart.icon || '☕'}
      </div>
    `,
        className: '',
        iconSize: [38, 38],
        iconAnchor: [19, 19],
    })

    async function handleSave() {
        if (!user) return
        setSaving(true)
        try {
            await addPin({
                title: cart.name,
                description: cart.description || '',
                lat: cart.lat,
                lng: cart.lng,
                linkUrl: cart.sourceUrl || '',
                iconType: 'coffee',
                pinColor: '#FF8C42',
                userId: user.uid
            })
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (error) {
            console.error('Failed to save pin:', error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Marker position={[cart.lat, cart.lng]} icon={cartIcon}>
            <Popup className="coffee-cart-popup">
                <div className="font-body text-center p-2 w-[260px]">
                    <h3 className="font-display font-semibold text-ntz-dark text-lg whitespace-nowrap overflow-hidden text-ellipsis mb-1">
                        {cart.name}
                    </h3>
                    <p className="text-xs text-ntz-blue font-medium mb-3">{cart.location}</p>
                    {cart.description && <p className="text-sm text-gray-600 mb-3">{cart.description}</p>}
                    
                    <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
                        {user && (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                            >
                                {saved ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {saved ? 'Saved!' : saving ? '...' : 'Save pin'}
                            </button>
                        )}
                    </div>

                    {/* Primary Navigation Buttons */}
                    <div className="flex flex-row gap-2 mt-2 w-full">
                        <a
                            href={`https://waze.com/ul?ll=${cart.lat},${cart.lng}&navigate=yes`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#4A90E2] hover:bg-[#3A80D2] py-2.5 rounded-full transition-colors shadow-sm cursor-pointer"
                        >
                            <Navigation className="w-3.5 h-3.5 text-white fill-white" />
                            Waze
                        </a>
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${cart.lat},${cart.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#37BA6B] hover:bg-[#2CA05A] py-2.5 rounded-full transition-colors shadow-sm cursor-pointer"
                        >
                            <Map className="w-3.5 h-3.5 text-white fill-white" />
                            Google Maps
                        </a>
                    </div>
                </div>
            </Popup>
        </Marker>
    )
}
