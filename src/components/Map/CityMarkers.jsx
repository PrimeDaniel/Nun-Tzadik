import { CircleMarker, Tooltip } from 'react-leaflet'

const CITIES = [
  { name: 'Jerusalem',     nameHe: 'ירושלים',    lat: 31.7683, lng: 35.2137, size: 7 },
  { name: 'Tel Aviv',      nameHe: 'תל אביב',     lat: 32.0853, lng: 34.7818, size: 7 },
  { name: 'Haifa',         nameHe: 'חיפה',        lat: 32.7940, lng: 34.9896, size: 6 },
  { name: 'Beer Sheva',    nameHe: 'באר שבע',     lat: 31.2530, lng: 34.7915, size: 6 },
  { name: 'Netanya',       nameHe: 'נתניה',       lat: 32.3291, lng: 34.8590, size: 5 },
  { name: 'Ashdod',        nameHe: 'אשדוד',       lat: 31.8044, lng: 34.6553, size: 5 },
  { name: 'Rishon LeZion', nameHe: 'ראשון לציון', lat: 31.9714, lng: 34.7893, size: 5 },
  { name: 'Nazareth',      nameHe: 'נצרת',        lat: 32.7021, lng: 35.2978, size: 5 },
  { name: 'Tiberias',      nameHe: 'טבריה',       lat: 32.7940, lng: 35.5300, size: 4 },
  { name: 'Eilat',         nameHe: 'אילת',        lat: 29.5569, lng: 34.9517, size: 5 },
  { name: 'Safed',         nameHe: 'צפת',         lat: 32.9646, lng: 35.4961, size: 4 },
  { name: 'Ashkelon',      nameHe: 'אשקלון',      lat: 31.6688, lng: 34.5743, size: 4 },
]

export default function CityMarkers() {
  return (
    <>
      {CITIES.map((city) => (
        <CircleMarker
          key={city.name}
          center={[city.lat, city.lng]}
          radius={city.size}
          pathOptions={{
            fillColor: '#333333',
            fillOpacity: 0.55,
            color: '#FFFFFF',
            weight: 1.5,
          }}
        >
          <Tooltip
            permanent={false}
            direction="top"
            offset={[0, -6]}
            className="city-tooltip"
          >
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', fontWeight: 600 }}>
              {city.name}
            </span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#A9A9A9', marginLeft: 4 }}>
              {city.nameHe}
            </span>
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  )
}
