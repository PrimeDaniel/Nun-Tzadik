import { Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import { getCategoryById } from './pinIcons'

function createPinIcon(category, color) {
  const cat = getCategoryById(category)
  const emoji = cat.emoji
  const bg = color || '#7B8EF5'

  const html = `
    <div class="ntz-pin-marker" style="position:relative;width:44px;height:52px;animation:pinDrop 0.35s cubic-bezier(0.34,1.56,0.64,1);">
      <div style="
        width:40px;height:40px;
        border-radius:50%;
        background:${bg};
        border:3px solid white;
        box-shadow:0 4px 12px rgba(0,0,0,0.25);
        display:flex;align-items:center;justify-content:center;
        font-size:20px;line-height:1;user-select:none;
        margin:0 auto;
        text-shadow:0 0 6px rgba(255,255,255,0.95),0 0 12px rgba(255,255,255,0.7);
      ">${emoji}</div>
      <div style="
        width:12px;height:10px;
        background:${bg};
        clip-path:polygon(50% 100%,0% 0%,100% 0%);
        margin:0 auto;
      "></div>
    </div>
  `

  return L.divIcon({
    html,
    className: '',
    iconSize: [44, 52],
    iconAnchor: [22, 52],
    popupAnchor: [0, -54],
  })
}

export default function PinMarker({ pin, onClick }) {
  const icon = createPinIcon(pin.iconType || 'general', pin.pinColor)

  return (
    <Marker
      position={[pin.lat, pin.lng]}
      icon={icon}
      eventHandlers={{ click: () => onClick(pin) }}
    >
      <Tooltip direction="top" offset={[0, -54]} opacity={0.95}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500 }}>
          {pin.title}
        </span>
      </Tooltip>
    </Marker>
  )
}
