import { Marker } from 'react-leaflet'
import L from 'leaflet'
import { getCategoryById } from './pinIcons'

function createPinIcon(category, isOwner) {
  const cat = getCategoryById(category)
  const emoji = cat.emoji

  const html = `
    <div class="ntz-pin-marker" style="position:relative;width:40px;height:48px;">
      <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pinGrad_${category}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#D9DFFF;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#BBE1FA;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FFC4D1;stop-opacity:1" />
          </linearGradient>
          <filter id="shadow_${category}" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(255,196,209,0.6)"/>
          </filter>
        </defs>
        <path d="M20 2C12.268 2 6 8.268 6 16C6 26 20 46 20 46C20 46 34 26 34 16C34 8.268 27.732 2 20 2Z"
          fill="url(#pinGrad_${category})"
          stroke="white"
          stroke-width="2"
          filter="url(#shadow_${category})"
        />
      </svg>
      <div style="position:absolute;top:6px;left:50%;transform:translateX(-50%);font-size:16px;line-height:1;user-select:none;">${emoji}</div>
    </div>
  `

  return L.divIcon({
    html,
    className: '',
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -50],
  })
}

export default function PinMarker({ pin, onClick }) {
  const icon = createPinIcon(pin.iconType || 'general', true)

  return (
    <Marker
      position={[pin.lat, pin.lng]}
      icon={icon}
      eventHandlers={{ click: () => onClick(pin) }}
    />
  )
}
