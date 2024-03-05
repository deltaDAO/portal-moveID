import { LoggerInstance, ProviderInstance } from '@oceanprotocol/lib'
import dynamic from 'next/dynamic'
import { ReactElement, useCallback, useEffect, useState } from 'react'
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
import { RoadDamageMapData } from './_types'
import {
  getResultBinaryData,
  transformBinaryToRoadDamageResult
} from './_utils'
import styles from './index.module.css'
import { toast } from 'react-toastify'
import { ROAD_DAMAGE_RESULT_ZIP } from './_constants'

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
  const [roadDamageData, setRoadDamageData] = useState<RoadDamageUseCaseData[]>(
    []
  )

  const [mapData, setMapData] = useState<RoadDamageMapData[]>([])

  useEffect(() => {
    if (!roadDamageList) return
    setRoadDamageData(roadDamageList)
  }, [roadDamageList])

  useEffect(() => {
    if (!roadDamageData || roadDamageData.length < 1) {
      setMapData([])
    }

    console.log('Road Damage Data Updated:')
    console.dir(roadDamageData, { depth: null })

    const newMapData: RoadDamageMapData[] = roadDamageData
      .map((data) => data.result)
      .reduce((previous, current) => previous.concat(current), [])

    setMapData(newMapData)
  }, [roadDamageData])

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
        console.log({
          computeJobs: computeJobs.computeJobs.filter((j) =>
            j.providerUrl.includes('dd1')
          )
        })
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

  const addComputeResultToLocalStorage = async (job: ComputeJobMetaData) => {
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

    createOrUpdateRoadDamage(newuseCaseData)
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
                  console.log('ADD JOB', job.jobId)
                  addComputeResultToLocalStorage(job)
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
            Map info calculated from {roadDamageData.length} compute job result
            {roadDamageData.length > 1 && 's'}.
          </span>
          <MapWithNoSSR data={mapData} />
        </div>
      )}
    </div>
  )
}
