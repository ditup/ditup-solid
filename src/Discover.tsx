import { useMemo } from 'react'
import { useAppSelector } from './app/hooks'
import { ditapi } from './app/services/ditapi'
// import { useDiscoverPeople } from './app/services/ditapi'
import { solidApi } from './app/services/solidApi'
import { useQueries } from './app/services/useQueries'
import { indexServers } from './config'
import { selectLogin } from './features/login/loginSlice'
import styles from './HorizontalList.module.scss'
import PersonSummary from './PersonSummary'
import { Person } from './types'

const Discover = () => {
  const webId = useAppSelector(selectLogin).webId
  /* stream version (results show up sooner, but not connected to rtk-query)
  const { data: discoveredPeople, isLoading } = useDiscoverPeople(webId)
  // */

  //* async version
  const { data: discoveredPeople, isLoading } =
    ditapi.endpoints.discoverPeople.useQuery(webId)
  // */
  const discoveredPeopleUris = useMemo(
    () => (discoveredPeople ?? []).map(person => person.uri),
    // () => (discoveredPeople ?? []).map(person => person.person),
    [discoveredPeople],
  )

  const personQueries = useQueries(
    solidApi.endpoints.readPerson,
    discoveredPeopleUris,
  )

  if (indexServers.length === 0)
    return (
      <div>
        No index servers were configured. You&apos;ll find nothing here.
      </div>
    )

  const fetchedPeople = personQueries
    .filter(query => query.data)
    .map(query => query.data)
    .filter(a => a) as Person[]

  return (
    <div>
      {(isLoading ||
        personQueries.find(
          query => query.isLoading || query.isUninitialized,
        )) && <div>Loading...</div>}
      <ul className={styles.horizontalList}>
        {fetchedPeople.map(thing => (
          <li key={thing.uri}>
            <PersonSummary person={thing} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Discover
