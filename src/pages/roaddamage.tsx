import { ReactElement } from 'react'
import Page from '@shared/Page'
import router from 'next/router'
import content from '../../content/pages/roaddamage.json'
import RoadDamage from '../components/RoadDamage'
import AssetProvider from '../@context/Asset'
import { ROAD_DAMAGE_ALGO_DID } from '../components/RoadDamage/_constants'

export default function PageRoadDamage(): ReactElement {
  const { title, description } = content

  return (
    <Page title={title} description={description} uri={router.route}>
      <AssetProvider did={ROAD_DAMAGE_ALGO_DID}>
        <RoadDamage />
      </AssetProvider>
    </Page>
  )
}
