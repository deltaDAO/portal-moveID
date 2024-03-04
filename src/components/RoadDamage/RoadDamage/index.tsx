import React, { ReactElement } from 'react'
import styles from './index.module.css'
import { RoadDamageMapData } from '../_types'
import Time from '../../@shared/atoms/Time'
import { getConfidenceColor } from '../_utils'
import Button from '../../@shared/atoms/Button'

export default function RoadDamageDetails({
  damage
}: {
  damage: RoadDamageMapData
}): ReactElement {
  const { image, roadDamages } = damage
  return (
    <div className={styles.wrapper}>
      {roadDamages.map((damage, index) => (
        <div key={`road-damage-details-${index}`} className={styles.detail}>
          <div className={styles.info}>
            <h2>
              {damage.damageClass}: {damage.type}
            </h2>
            <p>
              Observed <Time date={`${damage.lastObservation}`} relative />
            </p>
            <span>
              <strong>Confidence</strong>:{' '}
              <span style={{ color: getConfidenceColor(damage.confidence) }}>
                {damage.confidence}
              </span>
            </span>
            <div>
              <strong>Coordinates</strong>:{' '}
              <Button
                href={`https://www.openstreetmap.org/#map=7/${damage.gpsCoordinate.lat}/${damage.gpsCoordinate.lng}`}
                style="text"
              >
                {damage.gpsCoordinate.lat}, {damage.gpsCoordinate.lng}
              </Button>
            </div>
          </div>
          <div className={styles.image}>
            <img
              className={styles.mapImage}
              src={`data:image/${image.type || 'jpg'};base64,${image.data}`}
              alt={image.name}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
