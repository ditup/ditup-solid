import { skipToken } from '@reduxjs/toolkit/query'
import { useAppSelector } from './app/hooks'
import { getDitupUri, solidApi } from './app/services/solidApi'
import DitItem from './DitItem'
import styles from './HorizontalList.module.scss'
import { selectLogin } from './features/login/loginSlice'

const DitList = () => {
  const { webId } = useAppSelector(selectLogin)
  const { data, isLoading, isUninitialized } =
    solidApi.endpoints.readDitItems.useQuery(
      webId ? getDitupUri(webId) : skipToken,
    )
  if (isLoading || isUninitialized || !data) return <div>Loading...</div>

  return (
    <div>
      <ul className={styles.horizontalList}>
        {data.map(thing => (
          <li key={thing.uri}>
            <DitItem thing={thing} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DitList
