import intersection from 'lodash.intersection'
import { useMemo } from 'react'
import { useAppSelector } from './app/hooks'
import { ditapi } from './app/services/ditapi'
// import { useDiscoverPeople } from './app/services/ditapi'
import { getDitupUri, solidApi } from './app/services/solidApi'
import { useQueries } from './app/services/useQueries'
import { indexServers } from './config'
import DitItem from './DitItem'
import { selectLogin } from './features/login/loginSlice'
import HorizontalList from './HorizontalList'
import PersonSummary from './PersonSummary'
import { DitThing, Person } from './types'
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

  /* discover dit things related to current user by interest */
  const { data: discoveredDits, isLoading: isDiscoveringDits } =
    ditapi.endpoints.discoverDits.useQuery(webId)

  const discoveredDitUris = useMemo(
    () => (discoveredDits ?? []).map(thing => thing.uri),
    // () => (discoveredPeople ?? []).map(person => person.person),
    [discoveredDits],
  )

  const { data: myDits } = solidApi.endpoints.readDitItems.useQuery(
    getDitupUri(webId),
  )

  const ditQueries = useQueries(
    solidApi.endpoints.readDitItem,
    discoveredDitUris,
  )

  const me = useLoggedUser()

  if (!me || !myDits) return <>Loading self...</>

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

  const fetchedDits = ditQueries
    .filter(query => query.data)
    .map(query => query.data)
    .filter(a => a) as DitThing[]

  const peopleInCommon = fetchedPeople
    .map(
      person => [person, countMatch(person.interests, me.interests)] as const,
    )
    .sort((a, b) => b[1] - a[1])
    .filter(a => !!a[1])

  const myDitUris = myDits.map(dit => dit.uri)
  const ditsInCommon = fetchedDits
    .filter(dit => !myDitUris.includes(dit.uri))
    .map(thing => [thing, countMatch(thing.tags, me.interests)] as const)
    .sort((a, b) => b[1] - a[1])
    .filter(a => !!a[1])

  return (
    <div>
      {(isLoading ||
        personQueries.find(
          query => query.isLoading || query.isUninitialized,
        )) && <div>Searching People...</div>}
      {(isDiscoveringDits ||
        ditQueries.find(query => query.isLoading || query.isUninitialized)) && (
        <div>Searching Dits...</div>
      )}
      <HorizontalList>
        {peopleInCommon.map(([person, match]) => (
          <div key={person.uri}>
            <PersonSummary person={person} />{' '}
            <span>match: {Math.round(match * 1000) / 10}%</span>
          </div>
        ))}
        {ditsInCommon.map(([thing, match]) => (
          <div key={thing.uri}>
            <DitItem thing={thing} />{' '}
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
