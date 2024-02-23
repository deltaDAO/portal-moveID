import JSZipUtils from 'jszip-utils'
import JSZip from 'jszip'
import { RoadDamageImage, RoadDamageUseCaseData } from './_types'
import { ROAD_DAMAGE_RESULT_ZIP } from './_constants'
import { LoggerInstance } from '@oceanprotocol/lib'

export async function getResultBinaryData(url: string) {
  const resultData = await JSZipUtils.getBinaryContent(
    'https://raw.githubusercontent.com/deltaDAO/files/main/result.zip'
  )
  // const resultData = await JSZipUtils.getBinaryContent(jobResult)

  console.log({ resultData })

  return resultData
}

export async function transformBinaryToRoadDamageResult(
  binary: any
): Promise<RoadDamageUseCaseData['result']> {
  try {
    const zip = await JSZip.loadAsync(binary)

    const {
      folderName,
      detectionsFileName,
      imagesFolderName,
      metadataFileName
    } = ROAD_DAMAGE_RESULT_ZIP

    const detectionsString = await zip
      .file(`${folderName}/${detectionsFileName}`)
      .async('string')

    const detectionsJSON = JSON.parse(detectionsString)
    console.dir(detectionsJSON, { depth: null })

    const imageFilePaths = Object.keys(
      zip.folder(imagesFolderName).files
    ).filter(
      // make sure to only use jpg or jpeg files
      (path) => path.match('/.*\\.jp[e]?g')
    )

    const resultImages: RoadDamageImage[] = []
    for (const path of imageFilePaths) {
      const image: RoadDamageImage = {
        path,
        name: path.split('/').pop().split('.')[0], // path is 'result/images/file-name.jpg'
        data: await zip.file(path).async('base64'),
        type: path.split('.').pop() // try getting filetype from image path
      }
      resultImages.push(image)
    }

    console.log({ resultImages })

    return {
      detections: detectionsJSON,
      images: resultImages
    }
  } catch (e) {
    LoggerInstance.error(
      `Could not unzip result. Format may mismatch the current configuration.`,
      e
    )
  }
}
