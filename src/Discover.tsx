import intersection from 'lodash.intersection'
import { useMemo } from 'react'
import { useAppSelector } from './app/hooks'
import { ditapi } from './app/services/ditapi'
// import { useDiscoverPeople } from './app/services/ditapi'
import { solidApi } from './app/services/solidApi'
import { useQueries } from './app/services/useQueries'
import { indexServers } from './config'
import { selectLogin } from './features/login/loginSlice'
import HorizontalList from './HorizontalList'
import PersonSummary from './PersonSummary'
import { Person } from './types'
import useLoggedUser from './useLoggedUser'

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

  const me = useLoggedUser()

  if (!me) return <>Loading self...</>

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

  const peopleInCommon = fetchedPeople
    .map(
      person => [person, countMatch(person.interests, me.interests)] as const,
    )
    .sort((a, b) => b[1] - a[1])
    .filter(a => !!a[1])

  return (
    <div>
      {(isLoading ||
        personQueries.find(
          query => query.isLoading || query.isUninitialized,
        )) && <div>Loading...</div>}
      <HorizontalList>
        {peopleInCommon.map(([person, match]) => (
          <div key={person.uri}>
            <PersonSummary person={person} />{' '}
            <span>match: {Math.round(match * 1000) / 10}%</span>
          </div>
        ))}
      </HorizontalList>
    </div>
  )
}

export default Discover

const countMatch = (a: unknown[], b: unknown[]): number => {
  const common = intersection(a, b)
  return common.length && common.length / (a.length * b.length) ** 0.5
}
