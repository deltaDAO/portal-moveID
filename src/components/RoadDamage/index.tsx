import { LoggerInstance, ProviderInstance } from '@oceanprotocol/lib'
import dynamic from 'next/dynamic'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { useAccount, useSigner } from 'wagmi'
import { useAsset } from '../../@context/Asset'
import { useAutomation } from '../../@context/Automation/AutomationProvider'
import { useUserPreferences } from '../../@context/UserPreferences'
import { useCancelToken } from '../../@hooks/useCancelToken'
import { getAsset } from '../../@utils/aquarius'
import { getComputeJobs } from '../../@utils/compute'
import Button from '../@shared/atoms/Button'
import ComputeJobs from '../Profile/History/ComputeJobs'
import {
  ROAD_DAMAGE_RESULT_FILE_NAME,
  ROAD_DAMAGE_USECASE_NAME
} from './_constants'
import { RoadDamage, RoadDamageUseCaseData } from './_types'
import {
  getResultBinaryData,
  transformBinaryToRoadDamageResult
} from './_utils'

export default function RoadDamageMap(): ReactElement {
  const MapWithNoSSR = dynamic(() => import('./Map'), {
    ssr: false
  })

  const { address: accountId } = useAccount()
  const { data: signer } = useSigner()
  const { autoWallet } = useAutomation()

  const { asset: roadDamageAlgoAsset } = useAsset()
  const [jobs, setJobs] = useState<ComputeJobMetaData[]>([])
  const [refetchJobs, setRefetchJobs] = useState(false)
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const newCancelToken = useCancelToken()

  const { setUseCaseData, getUseCaseData } = useUserPreferences()
  const [roadDamageData, setRoadDamageData] = useState<RoadDamageUseCaseData[]>(
    []
  )

  const [mapData, setMapData] = useState<RoadDamage[]>([])

  useEffect(() => {
    const newUseCaseData = getUseCaseData<RoadDamageUseCaseData[]>(
      ROAD_DAMAGE_USECASE_NAME
    )
    console.log({ newUseCaseData })
    if (!newUseCaseData) return
    setRoadDamageData(newUseCaseData)
  }, [getUseCaseData])

  useEffect(() => {
    if (!roadDamageData || roadDamageData.length < 1) return

    console.log('Road Damage Data Updated:')
    console.dir(roadDamageData, { depth: null })

    const detections = roadDamageData
      .map((data) => data.result.detections)
      .reduce((previous, current) => previous.concat(current), [])

    console.log(`new detections:`, detections)

    setMapData(detections)
  }, [roadDamageData])

  const fetchJobs = useCallback(
    async (type: string) => {
      if (!accountId) {
        return
      }
      console.log({ roadDamageAlgoAsset, accountId })
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
              job.results.filter(
                (result) => result.filename === ROAD_DAMAGE_RESULT_FILE_NAME
              ).length > 0
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

    // init periodic refresh for jobs
    const refreshInterval = setInterval(() => fetchJobs('repeat'), 20000)

    return () => {
      clearInterval(refreshInterval)
    }
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
      job.results.findIndex(
        (result) => result.filename === ROAD_DAMAGE_RESULT_FILE_NAME
      )
    )

    const binary = await getResultBinaryData(jobResult)
    const resultData = await transformBinaryToRoadDamageResult(binary)

    if (!resultData?.detections) return

    const useCaseData = getUseCaseData<RoadDamageUseCaseData[]>(
      ROAD_DAMAGE_USECASE_NAME
    )

    const filteredUseCaseData: RoadDamageUseCaseData[] =
      useCaseData?.filter((data) => data.job.jobId !== job.jobId) || []

    const newuseCaseData: RoadDamageUseCaseData = {
      job,
      result: resultData
    }

    setUseCaseData<RoadDamageUseCaseData[]>(ROAD_DAMAGE_USECASE_NAME, [
      ...filteredUseCaseData,
      newuseCaseData
    ])
  }

  const clearData = () => {
    setUseCaseData(ROAD_DAMAGE_USECASE_NAME, [])
  }

  return (
    <div>
      <ComputeJobs
        minimal
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

      <Button onClick={clearData}>Clear Data</Button>
      {mapData && mapData.length > 0 && <MapWithNoSSR data={mapData} />}
      {roadDamageData && roadDamageData.length > 0 && (
        <div>
          {roadDamageData.map((data) => {
            return data.result?.images?.map((image, i) => (
              <div key={`${image.name}-${i}`}>
                <img
                  src={`data:image/${image.type || 'jpg'};base64,${image.data}`}
                  alt={image.name}
                />
              </div>
            ))
          })}
        </div>
      )}
    </div>
  )
}
