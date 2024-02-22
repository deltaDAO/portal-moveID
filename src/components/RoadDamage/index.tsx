import dynamic from 'next/dynamic'
import { ReactElement, useEffect, useState } from 'react'
import { RoadDamage, RoadDamageResult } from './_types'
import Button from '../@shared/atoms/Button'
import JSZip from 'jszip'
import JSZipUtils from 'jszip-utils'

const mapDataMock: RoadDamage[] = [
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
  },
  {
    type: 'pothole',
    damageClass: 'D10',
    lastObservation: '2001-10-26T21:32:52', // timestamp of image taken
    heading: 'string',
    gpsCoordinate: {
      lat: 12.5678,
      lng: 12.5678
    },
    confidence: 0.92
  }
]

export default function RoadDamageMap(): ReactElement {
  const MapWithNoSSR = dynamic(() => import('./Map'), {
    ssr: false
  })

  const [mapData, setMapData] = useState<RoadDamage[]>(mapDataMock)
  const [roadDamageResults, setRoadDamageResults] =
    useState<RoadDamageResult[]>()

  useEffect(() => {
    if (!roadDamageResults) return

    const newMapData = roadDamageResults
      .map((result) => result.roadDamages)
      .reduce((previous, current) => previous.concat(current))

    setMapData(newMapData)
  }, [roadDamageResults])

  const loadZip = async () => {
    const resultFolderName = 'result'
    const resultMetadataFile = 'metadata.json'
    const resultDetectionsFile = 'result.json'
    const resultImagesFolder = 'images'

    const path =
      'https://raw.githubusercontent.com/deltaDAO/files/main/sample-result.zip'
    const data = await JSZipUtils.getBinaryContent(path)
    console.log(data)

    const zip = await JSZip.loadAsync(data)

    const detectionsString = await zip
      .file(`${resultFolderName}/${resultDetectionsFile}`)
      .async('string')

    const detectionsJSON = JSON.parse(detectionsString)
    console.dir(detectionsJSON, { depth: null })
    setRoadDamageResults(detectionsJSON)
  }

  return (
    <div>
      <Button onClick={loadZip}>Load ZIP</Button>
      <MapWithNoSSR data={mapData} />
    </div>
  )
}
