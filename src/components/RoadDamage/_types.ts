export interface RoadDamageMetadata {
  containedTypes: RoadDamageType[]
  amountOfRecords: number
  inputDataFormat: string
  outputDataFormat: 'json' | 'yaml'
  usedDataOntology: string
}

export interface RoadDamageResult {
  resultName: string
  roadDamages: RoadDamage[]
}

export interface RoadDamage {
  type: RoadDamageType
  damageClass: string
  lastObservation: string
  heading: string
  gpsCoordinate: GPSCoordinate
  confidence: number
}

export interface GPSCoordinate {
  lat: number
  lng: number
}

export type RoadDamageType = string
