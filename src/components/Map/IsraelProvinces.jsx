import { useState, useEffect } from 'react'
import { GeoJSON } from 'react-leaflet'

// Maps GADM NAME_1 values to display names and brand colors
const DISTRICT_META = {
  HaZafon:   { name: 'Northern District',  nameHe: 'מחוז הצפון',   fill: '#D9DFFF', stroke: '#A8B4F8' },
  Haifa:     { name: 'Haifa District',     nameHe: 'מחוז חיפה',    fill: '#BBE1FA', stroke: '#7ABEF5' },
  HaMerkaz:  { name: 'Central District',   nameHe: 'מחוז המרכז',   fill: '#E8EDFF', stroke: '#B0B8F5' },
  TelAviv:   { name: 'Tel Aviv District',  nameHe: 'מחוז תל אביב', fill: '#FFD4DE', stroke: '#F5A0B8' },
  Jerusalem: { name: 'Jerusalem District', nameHe: 'מחוז ירושלים', fill: '#FFC4D1', stroke: '#F090AA' },
  HaDarom:   { name: 'Southern District',  nameHe: 'מחוז הדרום',   fill: '#D4EDFF', stroke: '#90CCEE' },
  Golan:     { name: 'Golan District',     nameHe: 'מחוז הגולן',   fill: '#DDE8FF', stroke: '#AAB8F8' },
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

  function styleFeature(feature) {
    const meta = DISTRICT_META[feature.properties.NAME_1]
    return {
      fillColor:   meta?.fill   || '#E8ECFF',
      fillOpacity: 0.18,
      color:       meta?.stroke || '#C0C8F0',
      weight:      1.5,
      opacity:     0.7,
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
      mouseover(e) { e.target.setStyle({ fillOpacity: 0.35, weight: 2 }) },
      mouseout(e)  { e.target.setStyle({ fillOpacity: 0.18, weight: 1.5 }) },
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
