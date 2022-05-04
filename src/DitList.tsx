import { skipToken } from '@reduxjs/toolkit/query'
import { useAppSelector } from './app/hooks'
import { getDitupUri, solidApi } from './app/services/solidApi'
import DitItem from './DitItem'
import { selectLogin } from './features/login/loginSlice'
import HorizontalList from './HorizontalList'

const DitList = () => {
  const { webId } = useAppSelector(selectLogin)
  const { data, isLoading, isUninitialized } =
    solidApi.endpoints.readDitItems.useQuery(
      webId ? getDitupUri(webId) : skipToken,
    )
  if (isLoading || isUninitialized || !data) return <div>Loading...</div>

  return (
    <HorizontalList>
      {data.map(thing => (
        <div key={thing.uri}>
          <DitItem thing={thing} />
        </div>
      ))}
    </HorizontalList>
  )
}

export default DitList
