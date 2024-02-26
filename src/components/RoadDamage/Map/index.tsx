import 'leaflet-defaulticon-compatibility'

import { LatLngTuple } from 'leaflet'
import { useEffect, useState } from 'react'
import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet'
import { RoadDamage, RoadDamageImage, RoadDamageMapData } from '../_types'
import styles from './index.module.css'

import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet/dist/leaflet.css'
import RoadDamageDetails from '../RoadDamage'
import { getConfidenceColor } from '../_utils'

export interface MapProps {
  data: (RoadDamage & { image: RoadDamageImage })[]
}

function Map({ data }: MapProps) {
  const [markers, setMarkers] = useState<JSX.Element[]>()
  const [center, setCenter] = useState<LatLngTuple>()
  const [currentDamage, setCurrentDamage] = useState<RoadDamageMapData>()

  useEffect(() => {
    const mapMarkers = data.map((d, index) => {
      d.gpsCoordinate.lng = Number(d.gpsCoordinate.lng)
      d.gpsCoordinate.lat = Number(d.gpsCoordinate.lat)

      return (
        <CircleMarker
          key={`${d.gpsCoordinate.lat}-${d.gpsCoordinate.lng}-${index}`}
          center={d.gpsCoordinate}
          pathOptions={{ color: getConfidenceColor(d.confidence) }}
          eventHandlers={{
            click: () => setCurrentDamage(d)
          }}
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
                .map((el) => Number(el | 0).toFixed(4))
                .toString()}
              ]
            </span>
          </Tooltip>
        </CircleMarker>
      )
    })

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

  return (
    <>
      <div className={styles.mapContainer}>
        {center ? (
          <div className={styles.mapContainer}>
            <MapContainer
              center={center}
              zoom={1}
              style={{ width: 900, height: 600, zIndex: 1 }}
              scrollWheelZoom={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {markers}
            </MapContainer>
          </div>
        ) : (
          <p>Calculating map...</p>
        )}
      </div>
      {currentDamage && <RoadDamageDetails damage={currentDamage} />}
    </>
  )
}

export default Map
