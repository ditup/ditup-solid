/* eslint-disable @typescript-eslint/no-explicit-any */

// https://github.com/reduxjs/redux-toolkit/discussions/1171#discussioncomment-2554980

import {
  QueryDefinition,
  EndpointDefinitions,
} from '@reduxjs/toolkit/query/react'

import { ApiEndpointQuery } from '@reduxjs/toolkit/dist/query/core/module'
import { useEffect } from 'react'
import { QueryActionCreatorResult } from '@reduxjs/toolkit/dist/query/core/buildInitiate'
import { useSelector } from 'react-redux'
import { store } from '../store'

/**
 * Allows running a query on a collection of data
 * @param query The RTK ApiEndpointQuery to run
 * @param params a list of params that will be run by the query
 * @returns the rtk query result (same as useGetXQuery())
 */
export function useQueries<
  Q extends QueryDefinition<any, any, any, any>,
  D extends EndpointDefinitions,
>(
  query: ApiEndpointQuery<Q, D>,
  params: Parameters<typeof query['initiate']>[0][],
) {
  useEffect(() => {
    const results: QueryActionCreatorResult<any>[] = params.map(param =>
      store.dispatch(query.initiate(param as any)),
    )
    return () => {
      for (const result of results) {
        result.unsubscribe()
      }
    }
  }, [query, params])
  return useSelector(state =>
    params.map(param => query.select(param)(state as any)),
  )
}
