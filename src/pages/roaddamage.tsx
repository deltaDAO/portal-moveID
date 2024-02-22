import { ReactElement } from 'react'
import Page from '@shared/Page'
import router from 'next/router'
import content from '../../content/pages/roaddamage.json'
import RoadDamage from '../components/RoadDamage'

export default function PageRoadDamage(): ReactElement {
  const { title, description } = content

  return (
    <Page title={title} description={description} uri={router.route}>
      <RoadDamage />
    </Page>
  )
}
