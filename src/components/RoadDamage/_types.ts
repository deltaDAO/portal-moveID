export interface RoadDamageMetadata {
  containedTypes: RoadDamageType[]
  amountOfRecords: number
  inputDataFormat: string
  outputDataFormat: 'json' | 'yaml'
  usedDataOntology: string
}

export interface RoadDamage {
  type: RoadDamageType
  damageClass: string
  lastObservation: string
  heading: string
  gpsCoordinate: GPSCoordinate
  confidence: number
}

export interface RoadDamageResult {
  resultName: string
  roadDamages: RoadDamage[]
}

export interface RoadDamageMapData extends RoadDamage {
  image: RoadDamageImage
}

export interface GPSCoordinate {
  lat: number
  lng: number
}

export type RoadDamageType = string

export interface RoadDamageImage {
  name: string
  path: string
  data: string
  type: string
}

export interface RoadDamageUseCaseData {
  job: ComputeJobMetaData
  result: {
    detections: RoadDamageResult[]
    images: RoadDamageImage[]
  }
}
