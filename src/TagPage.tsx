import { skipToken } from '@reduxjs/toolkit/dist/query'
import shuffle from 'lodash.shuffle'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { ditapi } from './app/services/ditapi'
import { interestApi } from './app/services/interestApi'
import { solidApi } from './app/services/solidApi'
import useFindAndGet from './app/services/useFindAndGet'
import DitItem from './DitItem'
import HorizontalList from './HorizontalList'
import MyTag from './MyTag'
import PersonSummary from './PersonSummary'
import TagList from './TagList'
import { DitThing, Person } from './types'

const TagPage = () => {
  const tagUri = useParams<'tagUri'>().tagUri

  const { data, isLoading, isUninitialized } =
    interestApi.endpoints.readInterest.useQuery(tagUri || skipToken)

  const queryInput = useMemo(
    () => (tagUri ? ([tagUri] as [string]) : skipToken),
    [tagUri],
  )

  const { data: relatedDits, isLoading: isLoadingDits } =
    useFindAndGet<DitThing>(
      queryInput,
      ditapi.endpoints.findDitsByTags,
      solidApi.endpoints.readDitItem,
    )

  const { data: relatedPeople, isLoading: isLoadingPeople } =
    useFindAndGet<Person>(
      queryInput,
      ditapi.endpoints.findPeopleByTags,
      solidApi.endpoints.readPerson,
    )

  const {
    data: relatedTags,
    isLoading: isLoadingTags,
    isUninitialized: isUninitializedTags,
  } = ditapi.endpoints.findTagsByTags.useQuery(queryInput)

  const tags = useMemo(
    () =>
      shuffle(relatedTags ?? [])
        .sort((a, b) => b.count - a.count)
        .map(a => a.uri)
        .slice(0, 10),
    [relatedTags],
  )

  if (isLoading || isUninitialized) return <>Loading...</>

  return (
    <div>
      {(isLoadingTags || isUninitializedTags) && <div>Loading Tags</div>}
      {isLoadingDits && <div>Loading dits</div>}
      {isLoadingPeople && <div>Loading people</div>}
      {!data ? (
        <>
          <div>
            <a href={tagUri}>
              {tagUri} <i className="icon-external-link" aria-hidden="true" />
            </a>
          </div>
          <div>Sorry, we couldn&apos;t fetch it</div>
          <div>
            Currently we only fetch tags from wikidata. Perhaps this one lives
            elsewhere?
          </div>
        </>
      ) : (
        <>
          {data.image && (
            <img
              style={{
                float: 'right',
                width: '20em',
                maxWidth: '40vw',
                margin: '-1.34rem 0 0 0',
              }}
              src={data.image}
              alt={`Image of ${data.label}`}
            />
          )}
          <header>
            <h1>
              {data.label} <MyTag uri={data.uri} />
            </h1>
            <p>{data.aliases.join(' • ')}</p>
            <small>
              <a href={data.uri}>{data.uri}</a>
            </small>
            {data.officialWebsite && (
              <p>
                website:{' '}
                <a href={data.officialWebsite}>{data.officialWebsite}</a>
              </p>
            )}
          </header>
          <section style={{ backgroundColor: 'pink' }}>
            {data.description}
          </section>
        </>
      )}
      <section>{tags && <TagList tags={tags} />}</section>
      <section>
        <HorizontalList>
          {relatedDits.map(dit => (
            <div key={dit.uri}>
              <DitItem thing={dit} />
            </div>
          ))}
          {relatedPeople.map(person => (
            <div key={person.uri}>
              <PersonSummary person={person} />
            </div>
          ))}
        </HorizontalList>
      </section>
    </div>
  )
}

export default TagPage
