import { ReactElement, useEffect, useState } from 'react'
import Button from '@shared/atoms/Button'
import { generateBaseQuery, getFilterTerm } from '@utils/aquarius'
import { useUserPreferences } from '@context/UserPreferences'
import { SortTermOptions } from '../../@types/aquarius/SearchQuery'
import SectionQueryResult from './SectionQueryResult'
import styles from './index.module.css'
import { useAddressConfig } from '@hooks/useAddressConfig'
import HomeContent from './Content'
import ProjectPartners from './ProjectPartners/ProjectPartners'
import Container from '@components/@shared/atoms/Container'
import FundedBy from './FundedBy/FundedBy'
import PoweredBy from './PoweredBy'

interface FeaturedSection {
  title: string
  query: SearchQuery
}

function AllAssetsButton(): ReactElement {
  return (
    <Button
      className={styles.allAssetsButton}
      style="text"
      to="/search?sort=nft.created&sortOrder=desc"
      arrow
    >
      All datasets and algorithms
    </Button>
  )
}

export default function HomePage(): ReactElement {
  const { chainIds } = useUserPreferences()
  const { featured, hasFeaturedAssets } = useAddressConfig()

  const [queryFeatured, setQueryFeatured] = useState<FeaturedSection[]>([])
  const [queryRecent, setQueryRecent] = useState<SearchQuery>()
  const [queryMostSales, setQueryMostSales] = useState<SearchQuery>()

  const { showOnboardingModule } = useUserPreferences()

  useEffect(() => {
    const baseParams = {
      chainIds,
      esPaginationOptions: {
        size: 6
      },
      sortOptions: {
        sortBy: SortTermOptions.Created
      } as SortOptions
    } as BaseQueryParams

    const baseParamsSales = {
      chainIds,
      esPaginationOptions: {
        size: 6
      },
      sortOptions: {
        sortBy: SortTermOptions.Orders
      } as SortOptions
    } as BaseQueryParams

    setQueryRecent(generateBaseQuery(baseParams))
    setQueryMostSales(generateBaseQuery(baseParamsSales))

    if (hasFeaturedAssets()) {
      const featuredSections = featured.map((section) => ({
        title: section.title,
        query: generateBaseQuery({
          ...baseParams,
          esPaginationOptions: {
            size: section.assets.length
          },
          filters: [getFilterTerm('_id', section.assets)]
        })
      }))

      setQueryFeatured(featuredSections)
    }
  }, [chainIds, featured, hasFeaturedAssets])

  return (
    <>
      <Container>
        {hasFeaturedAssets() && (
          <>
            {queryFeatured.map((section, i) => (
              <SectionQueryResult
                key={`${section.title}-${i}`}
                title={section.title}
                query={section.query}
              />
            ))}
            <AllAssetsButton />
          </>
        )}
        <HomeContent />
      </Container>
      <ProjectPartners />
      <FundedBy />
      <PoweredBy />
    </>
  )
}
