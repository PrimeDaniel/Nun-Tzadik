import { useState, useEffect } from 'react'
import { GeoJSON } from 'react-leaflet'

// Maps GADM NAME_1 values to display names
const DISTRICT_META = {
  HaZafon:   { name: 'Northern District',  nameHe: 'מחוז הצפון'   },
  Haifa:     { name: 'Haifa District',     nameHe: 'מחוז חיפה'    },
  HaMerkaz:  { name: 'Central District',   nameHe: 'מחוז המרכז'   },
  TelAviv:   { name: 'Tel Aviv District',  nameHe: 'מחוז תל אביב' },
  Jerusalem: { name: 'Jerusalem District', nameHe: 'מחוז ירושלים' },
  HaDarom:   { name: 'Southern District',  nameHe: 'מחוז הדרום'   },
  Golan:     { name: 'Golan District',     nameHe: 'מחוז הגולן'   },
}

export default function IsraelProvinces() {
  const [geoData, setGeoData] = useState(null)

  useEffect(() => {
    fetch('/israel-districts.json')
      .then((r) => r.json())
      .then(setGeoData)
      .catch((err) => console.warn('Could not load district boundaries:', err))
  }, [])

  if (!geoData) return null

  function styleFeature() {
    return {
      fillOpacity: 0,
      color:       '#7B8EF5',
      weight:      2,
      opacity:     0.6,
    }
  }

  function onEachFeature(feature, layer) {
    const meta = DISTRICT_META[feature.properties.NAME_1]
    if (!meta) return

    layer.bindTooltip(
      `<div style="font-family:'DM Sans',sans-serif;text-align:center;">
        <div style="font-weight:600;font-size:13px;">${meta.name}</div>
        <div style="font-size:11px;color:#A9A9A9;">${meta.nameHe}</div>
      </div>`,
      { sticky: true, className: 'district-tooltip', direction: 'top' }
    )

    layer.on({
      mouseover(e) { e.target.setStyle({ weight: 3, opacity: 1 }) },
      mouseout(e)  { e.target.setStyle({ weight: 2, opacity: 0.6 }) },
    })
  }

  return (
    <GeoJSON
      data={geoData}
      style={styleFeature}
      onEachFeature={onEachFeature}
    />
  )
}
