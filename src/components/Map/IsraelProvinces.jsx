import { GeoJSON, Tooltip } from 'react-leaflet'
import { useRef } from 'react'
import districts from '../../data/israel-districts.geojson'

const DISTRICT_COLORS = {
  north:      { fill: '#D9DFFF', stroke: '#B0B8F0' },
  haifa:      { fill: '#BBE1FA', stroke: '#8EC8F5' },
  central:    { fill: '#FFC4D1', stroke: '#F0A0B2' },
  'tel-aviv': { fill: '#D9DFFF', stroke: '#B0B8F0' },
  jerusalem:  { fill: '#FFC4D1', stroke: '#F0A0B2' },
  south:      { fill: '#BBE1FA', stroke: '#8EC8F5' },
}

export default function IsraelProvinces() {
  const geojsonRef = useRef()

  function styleFeature(feature) {
    const colors = DISTRICT_COLORS[feature.properties.districtId] || { fill: '#E8ECFF', stroke: '#C0C8F0' }
    return {
      fillColor: colors.fill,
      fillOpacity: 0.18,
      color: colors.stroke,
      weight: 1.5,
      opacity: 0.6,
    }
  }

  function onEachFeature(feature, layer) {
    const { name, nameHe } = feature.properties

    layer.bindTooltip(
      `<div class="font-body text-center"><div class="font-medium">${name}</div><div class="text-xs text-ntz-light">${nameHe}</div></div>`,
      { sticky: true, className: 'district-tooltip', direction: 'top' }
    )

    layer.on({
      mouseover(e) {
        e.target.setStyle({ fillOpacity: 0.35, weight: 2 })
      },
      mouseout(e) {
        e.target.setStyle({ fillOpacity: 0.18, weight: 1.5 })
      },
    })
  }

  return (
    <GeoJSON
      ref={geojsonRef}
      data={districts}
      style={styleFeature}
      onEachFeature={onEachFeature}
    />
  )
}
