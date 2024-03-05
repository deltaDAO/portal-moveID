import { RoadDamage } from './_types'

export const ROAD_DAMAGE_ALGO_DID =
  'did:op:926098d058b017dcf3736370f3c3d77e6046ca6622af111229accf5f9c83e308'

export const ROAD_DAMAGE_USECASE_NAME = 'roaddamage'

export const ROAD_DAMAGE_RESULT_ZIP = {
  fileName: 'result.zip',
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
