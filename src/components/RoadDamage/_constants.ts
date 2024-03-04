import { RoadDamage } from './_types'

export const ROAD_DAMAGE_ALGO_DID =
  'did:op:b4be1f60c197890bfebc041e66731a2c6f98f520169a9f38173c19e29353b4d0' // GEN-X
// 'did:op:a1f800fadd32267ae6662b4e411396bd180242ca8274810c9e1a771f3920468d' // PONTUS-X

export const ROAD_DAMAGE_RESULT_FILE_NAME = 'model'

export const ROAD_DAMAGE_USECASE_NAME = 'roaddamage'

export const ROAD_DAMAGE_RESULT_ZIP = {
  metadataFileName: 'metadata.json',
  detectionsFileName: 'detections.json',
  imagesFolderName: 'images'
}

export const CONFIDENCE_COLOR_MAP = [
  {
    threshold: 0.85,
    color: 'blue'
  },
  {
    threshold: 0.66,
    color: 'green'
  },
  {
    threshold: 0.5,
    color: 'orange'
  },
  {
    threshold: 0.33,
    color: 'firebrick'
  },
  {
    threshold: 0,
    color: 'grey'
  }
]

const mapDataMock: RoadDamage[] = [
  {
    type: 'crack',
    damageClass: 'D10',
    lastObservation: '2001-10-26T21:32:52', // timestamp of image taken
    heading: 'string',
    gpsCoordinates: {
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
    gpsCoordinates: {
      lat: 12.5678,
      lng: 12.5678
    },
    confidence: 0.92
  }
]
