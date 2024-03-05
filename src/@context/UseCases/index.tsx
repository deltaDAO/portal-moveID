import Dexie, { IndexableType, Table } from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'
import { ReactElement, ReactNode, createContext, useContext } from 'react'
import { DATABASE_NAME } from './_contants'
import {
  ROAD_DAMAGE_TABLE,
  RoadDamageUseCaseData
} from './models/RoadDamage.model'
import { LoggerInstance } from '@oceanprotocol/lib'

export class UseCaseDB extends Dexie {
  roadDamages!: Table<RoadDamageUseCaseData>
  constructor() {
    super(DATABASE_NAME)
    this.version(1).stores({
      ...ROAD_DAMAGE_TABLE
    })
  }
}

export const database = new UseCaseDB()

interface UseCasesValue {
  createOrUpdateRoadDamage: (
    roadDamage: RoadDamageUseCaseData
  ) => Promise<IndexableType>
  roadDamageList: RoadDamageUseCaseData[]
  updateRoadDamages: (
    roadDamages: RoadDamageUseCaseData[],
    keys: number[]
  ) => Promise<IndexableType>
  clearRoadDamages: () => Promise<void>
}

const UseCasesContext = createContext(null)

function UseCasesProvider({ children }: { children: ReactNode }): ReactElement {
  const roadDamageList = useLiveQuery(() => database.roadDamages.toArray())

  const createOrUpdateRoadDamage = async (
    roadDamage: RoadDamageUseCaseData
  ) => {
    const exists = roadDamageList.find(
      (row) => roadDamage.job.jobId === row.job.jobId
    )

    const updated = await database.roadDamages.put(
      {
        ...roadDamage
      },
      exists?.id
    )

    LoggerInstance.log(`[UseCases]: create or update roadDamages table`, {
      roadDamage,
      updated
    })

    return updated
  }

  const updateRoadDamages = async (
    roadDamages: RoadDamageUseCaseData[],
    keys: number[]
  ): Promise<IndexableType> => {
    const updated = await database.roadDamages.bulkPut(roadDamages, keys)

    LoggerInstance.log(`[UseCases]: update roadDamages table`, {
      roadDamages,
      keys,
      updated
    })

    return updated
  }

  const clearRoadDamages = async () => {
    const cleared = await database.roadDamages.clear()

    LoggerInstance.log(`[UseCases]: clear roadDamages table`, { cleared })

    return cleared
  }

  return (
    <UseCasesContext.Provider
      value={
        {
          createOrUpdateRoadDamage,
          roadDamageList,
          updateRoadDamages,
          clearRoadDamages
        } satisfies UseCasesValue
      }
    >
      {children}
    </UseCasesContext.Provider>
  )
}

// Helper hook to access the provider values
const useUseCases = (): UseCasesValue => useContext(UseCasesContext)

export { UseCasesProvider, useUseCases }
