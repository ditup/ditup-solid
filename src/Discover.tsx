import intersection from 'lodash.intersection'
import { useAppSelector } from './app/hooks'
import { ditapi } from './app/services/ditapi'
import { getDitupUri, solidApi } from './app/services/solidApi'
import useFindAndGet from './app/services/useFindAndGet'
import { indexServers } from './config'
import DitItem from './DitItem'
import { selectLogin } from './features/login/loginSlice'
import HorizontalList from './HorizontalList'
import PersonSummary from './PersonSummary'
import { DitThing, Person } from './types'
import useLoggedUser from './useLoggedUser'

const Discover = () => {
  const webId = useAppSelector(selectLogin).webId

  // fetch people related to me
  const { data: discoveredPeople, isLoading: isLoadingPeople } =
    useFindAndGet<Person>(
      [webId],
      ditapi.endpoints.discoverPeople,
      solidApi.endpoints.readPerson,
    )

  // fetch dits related to me
  const { data: discoveredDits, isLoading: isLoadingDits } =
    useFindAndGet<DitThing>(
      [webId],
      ditapi.endpoints.discoverDits,
      solidApi.endpoints.readDitItem,
    )

  const { data: myDits } = solidApi.endpoints.readDitItems.useQuery(
    getDitupUri(webId),
  )

  const me = useLoggedUser()

  if (!me || !myDits) return <>Loading self...</>

  if (indexServers.length === 0)
    return (
      <div>
        No index servers were configured. You&apos;ll find nothing here.
      </div>
    )

  const peopleInCommon = discoveredPeople
    .map(
      person => [person, countMatch(person.interests, me.interests)] as const,
    )
    .sort((a, b) => b[1] - a[1])
    .filter(a => !!a[1])

  const myDitUris = myDits.map(dit => dit.uri)
  const ditsInCommon = discoveredDits
    .filter(dit => !myDitUris.includes(dit.uri))
    .map(thing => [thing, countMatch(thing.tags, me.interests)] as const)
    .sort((a, b) => b[1] - a[1])
    .filter(a => !!a[1])

  return (
    <div>
      {isLoadingPeople && <div>Searching People...</div>}
      {isLoadingDits && <div>Searching Dits...</div>}
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
