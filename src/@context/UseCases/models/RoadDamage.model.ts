import { RoadDamageMapData } from '../../../components/RoadDamage/_types'

/**
 * Table config
 */
export interface RoadDamageUseCaseData {
  id?: number
  job: ComputeJobMetaData
  result: RoadDamageMapData[]
}

export const ROAD_DAMAGE_TABLE = {
  roadDamages: '++id, job, result'
}
