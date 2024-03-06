import { LoggerInstance, ProviderInstance } from '@oceanprotocol/lib'
import dynamic from 'next/dynamic'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { useAccount, useSigner } from 'wagmi'
import { useAutomation } from '../../@context/Automation/AutomationProvider'
import { useUseCases } from '../../@context/UseCases'
import { RoadDamageUseCaseData } from '../../@context/UseCases/models/RoadDamage.model'
import { useCancelToken } from '../../@hooks/useCancelToken'
import { getAsset } from '../../@utils/aquarius'
import { getComputeJobs } from '../../@utils/compute'
import Accordion from '../@shared/Accordion'
import Button from '../@shared/atoms/Button'
import ComputeJobs from '../Profile/History/ComputeJobs'
import { ROAD_DAMAGE_RESULT_ZIP, ROAD_DAMAGE_ALGO_DIDS } from './_constants'
import {
  getMapColor,
  getResultBinaryData,
  transformBinaryToRoadDamageResult
} from './_utils'
import styles from './index.module.css'
import { useUserPreferences } from '../../@context/UserPreferences'

export default function RoadDamageMap(): ReactElement {
  const MapWithNoSSR = dynamic(() => import('./Map'), {
    ssr: false
  })

  const { chainIds } = useUserPreferences()
  const roadDamageAlgoChains: number[] = Object.keys(ROAD_DAMAGE_ALGO_DIDS).map(
    (key) => Number(key)
  )
  const roadDamageAlgoDids: string[] = Object.values(ROAD_DAMAGE_ALGO_DIDS)

  const { address: accountId } = useAccount()
  const { data: signer } = useSigner()
  const { autoWallet } = useAutomation()

  const { fileName: resultFileName } = ROAD_DAMAGE_RESULT_ZIP
  const [jobs, setJobs] = useState<ComputeJobMetaData[]>([])
  const [refetchJobs, setRefetchJobs] = useState(false)
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const newCancelToken = useCancelToken()

  const scrollToMapRef = useRef<any>()

  const {
    createOrUpdateRoadDamage,
    roadDamageList,
    deleteRoadDamage,
    clearRoadDamages
  } = useUseCases()

  const [mapData, setMapData] = useState<RoadDamageUseCaseData[]>([])

  useEffect(() => {
    if (!roadDamageList) {
      setMapData([])
      return
    }

    setMapData(roadDamageList)
  }, [roadDamageList])

  const fetchJobs = useCallback(async () => {
    if (!accountId) {
      return
    }

    try {
      setIsLoadingJobs(true)
      // Fetch computeJobs for all selected networks (UserPreferences)
      const computeJobs = await getComputeJobs(
        chainIds,
        accountId,
        null,
        newCancelToken()
      )
      if (autoWallet) {
        const autoComputeJobs = await getComputeJobs(
          chainIds,
          autoWallet?.address,
          null,
          newCancelToken()
        )
        autoComputeJobs.computeJobs.forEach((job) => {
          computeJobs.computeJobs.push(job)
        })
      }

      setJobs(
        // Filter computeJobs for dids configured in _constants
        computeJobs.computeJobs.filter(
          (job) =>
            roadDamageAlgoDids.includes(job.algoDID) &&
            job.status === 70 &&
            job.results.filter((result) => result.filename === resultFileName)
              .length > 0
        )
      )
      setIsLoadingJobs(!computeJobs.isLoaded)
    } catch (error) {
      LoggerInstance.error(error.message)
      setIsLoadingJobs(false)
    }
  }, [
    chainIds,
    roadDamageAlgoChains,
    roadDamageAlgoDids,
    accountId,
    autoWallet,
    newCancelToken
  ])

  useEffect(() => {
    fetchJobs()
  }, [refetchJobs, chainIds])

  const addComputeResultToUseCaseDB = async (job: ComputeJobMetaData) => {
    if (roadDamageList.find((row) => row.job.jobId === job.jobId)) {
      toast.info('This compute job result already is part of the map view.')
      return
    }

    const dataForSameInputExists =
      roadDamageList.filter(
        (row) =>
          job.inputDID.filter((did) => row.job.inputDID.includes(did))
            .length === job.inputDID.length
      ).length > 0

    if (dataForSameInputExists)
      if (
        !confirm(
          'Compute job results for a job with the same dataset inputs already exists. Add anyways?'
        )
      )
        return

    try {
      const datasetDDO = await getAsset(job.inputDID[0], newCancelToken())

      const signerToUse =
        job.owner.toLowerCase() === autoWallet?.address.toLowerCase()
          ? autoWallet
          : signer

      const jobResult = await ProviderInstance.getComputeResultUrl(
        datasetDDO.services[0].serviceEndpoint,
        signerToUse,
        job.jobId,
        job.results.findIndex((result) => result.filename === resultFileName)
      )

      const binary = await getResultBinaryData(jobResult)
      const resultData = await transformBinaryToRoadDamageResult(binary)

      if (!resultData) return

      const newuseCaseData: RoadDamageUseCaseData = {
        job,
        result: resultData
      }

      await createOrUpdateRoadDamage(newuseCaseData)
      toast.success('Added a new compute result')
    } catch (error) {
      LoggerInstance.error(error)
      toast.error('Could not add compute result')
    }
  }

  const deleteJobResultFromDB = async (job: ComputeJobMetaData) => {
    if (!confirm(`Are you sure you want to delete the result from map view?`))
      return

    const rowToDelete = roadDamageList.find(
      (row) => row.job.jobId === job.jobId
    )
    if (!rowToDelete) return

    await deleteRoadDamage(rowToDelete.id)
    toast.success(`Removed compute job result from map view.`)
  }

  const clearData = async () => {
    if (mapData.length < 1) return
    if (!confirm('All data will be removed from your cache. Proceed?')) return

    await clearRoadDamages()
    toast.success('Road Damage data was cleared.')
  }

  const getCustomActionsPerComputeJob = (job: ComputeJobMetaData) => {
    const addAction = {
      label: 'Add',
      onClick: () => {
        addComputeResultToUseCaseDB(job)
      }
    }
    const deleteAction = {
      label: 'Remove',
      onClick: () => {
        deleteJobResultFromDB(job)
      }
    }
    const colorLeged = {
      label: (
        <span
          className={styles.legend}
          style={{ backgroundColor: getMapColor(job.inputDID) }}
        />
      ),
      onClick: () => {
        if (scrollToMapRef?.current) scrollToMapRef.current.scrollIntoView()
      }
    }

    const viewContainsResult = roadDamageList.find(
      (row) => row.job.jobId === job.jobId
    )

    const actionArray = []

    if (viewContainsResult) {
      actionArray.push(deleteAction)
      actionArray.push(colorLeged)
    } else actionArray.push(addAction)

    return actionArray
  }

  return (
    <div>
      <div className={styles.accordionWrapper}>
        <Accordion title="Compute Jobs" defaultExpanded>
          <ComputeJobs
            jobs={jobs}
            isLoading={isLoadingJobs}
            refetchJobs={() => setRefetchJobs(!refetchJobs)}
            getActions={getCustomActionsPerComputeJob}
            hideDetails
          />

          <div className={styles.actions}>
            <Button onClick={() => clearData()}>Clear Data</Button>
          </div>
        </Accordion>
      </div>
      {mapData && mapData.length > 0 && (
        <div ref={scrollToMapRef}>
          <span className={styles.info}>
            Map info calculated from {mapData.length} compute job result
            {mapData.length > 1 && 's'}.
          </span>
          <MapWithNoSSR data={mapData} />
        </div>
      )}
    </div>
  )
}
