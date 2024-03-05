import { LoggerInstance, ProviderInstance } from '@oceanprotocol/lib'
import dynamic from 'next/dynamic'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAccount, useSigner } from 'wagmi'
import { useAsset } from '../../@context/Asset'
import { useAutomation } from '../../@context/Automation/AutomationProvider'
import { useUseCases } from '../../@context/UseCases'
import { RoadDamageUseCaseData } from '../../@context/UseCases/models/RoadDamage.model'
import { useCancelToken } from '../../@hooks/useCancelToken'
import { getAsset } from '../../@utils/aquarius'
import { getComputeJobs } from '../../@utils/compute'
import Accordion from '../@shared/Accordion'
import Button from '../@shared/atoms/Button'
import ComputeJobs from '../Profile/History/ComputeJobs'
import { ROAD_DAMAGE_RESULT_ZIP } from './_constants'
import {
  getResultBinaryData,
  transformBinaryToRoadDamageResult
} from './_utils'
import styles from './index.module.css'

export default function RoadDamageMap(): ReactElement {
  const MapWithNoSSR = dynamic(() => import('./Map'), {
    ssr: false
  })

  const { address: accountId } = useAccount()
  const { data: signer } = useSigner()
  const { autoWallet } = useAutomation()

  const { asset: roadDamageAlgoAsset } = useAsset()
  const { fileName: resultFileName } = ROAD_DAMAGE_RESULT_ZIP
  const [jobs, setJobs] = useState<ComputeJobMetaData[]>([])
  const [refetchJobs, setRefetchJobs] = useState(false)
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const newCancelToken = useCancelToken()

  const { createOrUpdateRoadDamage, roadDamageList, clearRoadDamages } =
    useUseCases()

  const [mapData, setMapData] = useState<RoadDamageUseCaseData[]>([])

  useEffect(() => {
    if (!roadDamageList) {
      setMapData([])
      return
    }

    setMapData(roadDamageList)
  }, [roadDamageList])

  const fetchJobs = useCallback(
    async (type: string) => {
      if (!accountId) {
        return
      }

      try {
        type === 'init' && setIsLoadingJobs(true)
        const computeJobs = await getComputeJobs(
          [roadDamageAlgoAsset?.chainId],
          accountId,
          null,
          newCancelToken()
        )
        if (autoWallet) {
          const autoComputeJobs = await getComputeJobs(
            [roadDamageAlgoAsset?.chainId],
            autoWallet?.address,
            null,
            newCancelToken()
          )
          autoComputeJobs.computeJobs.forEach((job) => {
            computeJobs.computeJobs.push(job)
          })
        }

        setJobs(
          computeJobs.computeJobs.filter(
            (job) =>
              job.algoDID === roadDamageAlgoAsset?.id &&
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
    },
    [accountId, roadDamageAlgoAsset, autoWallet, newCancelToken]
  )

  useEffect(() => {
    fetchJobs('init')
  }, [refetchJobs])

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

  const clearData = async () => {
    if (mapData.length < 1) return
    if (!confirm('All data will be removed from your cache. Proceed?')) return

    await clearRoadDamages()
    toast.success('Road Damage data was cleared.')
  }

  return (
    <div>
      <div className={styles.accordionWrapper}>
        <Accordion title="Compute Jobs" defaultExpanded>
          <ComputeJobs
            jobs={jobs}
            isLoading={isLoadingJobs}
            refetchJobs={() => setRefetchJobs(!refetchJobs)}
            actions={[
              {
                label: 'Add',
                onClick: (job) => {
                  addComputeResultToUseCaseDB(job)
                }
              }
            ]}
            hideDetails
          />

          <div className={styles.actions}>
            <Button onClick={() => clearData()}>Clear Data</Button>
            <Button onClick={() => fetchJobs('refresh')} style="text">
              Refetch Compute Jobs
            </Button>
          </div>
        </Accordion>
      </div>
      {mapData && mapData.length > 0 && (
        <div>
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