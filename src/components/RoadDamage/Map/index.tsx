import 'leaflet-defaulticon-compatibility'

import { LatLngTuple } from 'leaflet'
import { useEffect, useState } from 'react'
import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet'
import { RoadDamage } from '../_types'

import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'

export interface MapProps {
  data: RoadDamage[]
}

function Map({ data }: MapProps) {
  const [markers, setMarkers] = useState<JSX.Element[]>()
  const [center, setCenter] = useState<LatLngTuple>()

  const getConfidenceColor = (confidence: number) => {
    return confidence < 0.33
      ? 'grey'
      : confidence < 0.5
      ? 'firebrick'
      : confidence < 0.66
      ? 'orange'
      : confidence < 0.85
      ? 'green'
      : 'blue'
  }

  useEffect(() => {
    const mapMarkers = data.map((d, index) => (
      <CircleMarker
        key={`${d.gpsCoordinate.lat}-${d.gpsCoordinate.lng}-${index}`}
        center={d.gpsCoordinate}
        pathOptions={{ color: getConfidenceColor(d.confidence) }}
      >
        <Tooltip>
          <strong>
            Road Damage{' '}
            <span style={{ color: getConfidenceColor(d.confidence) }}>
              ({Math.round(d.confidence * 100)}%)
            </span>
          </strong>
          <br />
          <span>Type: {d.type}</span>
          <br />
          <span>
            Coordinates: [
            {Object.values(d.gpsCoordinate)
              .map((el) => el.toFixed(4))
              .toString()}
            ]
          </span>
        </Tooltip>
      </CircleMarker>
    ))

    setMarkers(mapMarkers)

    const coords = data.map((d) => d.gpsCoordinate)

    const sum = coords.reduce(
      (partialSum, c) => {
        partialSum[0] += c.lat
        partialSum[1] += c.lng
        return partialSum
      },
      [0, 0]
    )

    const centroid = sum.map((el) => {
      const avg = el / Object.entries(data).length
      return Number(avg.toFixed(6))
    })

    setCenter(centroid as LatLngTuple)

    console.log('update map', { coords, centroid })
  }, [data])

  return center ? (
    <MapContainer
      center={center}
      zoom={13}
      style={{ width: 800, height: 400, zIndex: 1 }}
      scrollWheelZoom={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {markers}
    </MapContainer>
  ) : (
    <p>Calculating map...</p>
  )
}

export default Map
