import dynamic from 'next/dynamic'
import { ReactElement } from 'react'
import { RoadDamage } from './_types'

const mapData: RoadDamage[] = [
  {
    type: 'crack',
    damageClass: 'D10',
    lastObservation: '2001-10-26T21:32:52', // timestamp of image taken
    heading: 'string',
    gpsCoordinate: {
      lat: 12.1234,
      lng: 12.1234
    },
    confidence: 0.23
  }
]

export default function RoadDamageMap(): ReactElement {
  const MapWithNoSSR = dynamic(() => import('./Map'), {
    ssr: false
  })

  return <MapWithNoSSR data={mapData} />
}
