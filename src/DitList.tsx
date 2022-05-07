import { getDitupUri, solidApi } from './app/services/solidApi'
import DitItem from './DitItem'
import HorizontalList from './HorizontalList'

const DitList = ({ person }: { person: string }) => {
  /* @TODO we may want to use another function here
  not 'read dit items', but 'read dits of person' */
  const { data, isLoading, isUninitialized } =
    solidApi.endpoints.readDitItems.useQuery(getDitupUri(person))

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
