import React from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

export default function CoffeeCartMarker({ cart }) {
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

    return (
        <Marker position={[cart.lat, cart.lng]} icon={cartIcon}>
            <Popup className="coffee-cart-popup">
                <div className="font-body text-center p-1">
                    <h3 className="font-display font-semibold text-ntz-dark text-lg whitespace-nowrap overflow-hidden text-ellipsis mb-1">
                        {cart.name}
                    </h3>
                    <p className="text-xs text-ntz-blue font-medium mb-2">{cart.location}</p>
                    <p className="text-sm text-gray-600 mb-0">{cart.description}</p>
                </div>
            </Popup>
        </Marker>
    )
}
