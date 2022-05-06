import { skipToken } from '@reduxjs/toolkit/query'
import { useMemo } from 'react'
import { ditapi } from './ditapi'
import { solidApi } from './solidApi'
import { useQueries } from './useQueries'

// @TODO we could type this hook better

type FindQuery =
  | typeof ditapi.endpoints.findPeopleByTags
  | typeof ditapi.endpoints.findDitsByTags

type GetQuery =
  | typeof solidApi.endpoints.readDitItem
  | typeof solidApi.endpoints.readPerson

const useFindAndGet = <Output>(
  input: [string, ...string[]] | typeof skipToken,
  findQuery: FindQuery,
  getQuery: GetQuery,
) => {
  const {
    data: found,
    isLoading: isFinding,
    isUninitialized: isNotYetFinding,
  } = findQuery.useQuery(input)

  const foundUris = useMemo(
    () => (found ?? []).map(thing => thing.uri),
    [found],
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queries = useQueries(getQuery as any, foundUris)

  const results = queries
    .filter(query => query.data)
    .map(query => query.data as Output)

  const isGetting = queries.some(
    query => query.isLoading || query.isUninitialized,
  )

  return {
    data: results,
    isLoading: isFinding || isGetting || isNotYetFinding,
  }
}

export default useFindAndGet
