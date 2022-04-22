// Need to use the React-specific entry point to import createApi
import {
  addUrl,
  createThing,
  getSolidDataset,
  getThing,
  getUrlAll,
  removeUrl,
  saveSolidDatasetAt,
  setThing,
  SolidDataset,
  WithChangeLog,
} from '@inrupt/solid-client'
import { fetch } from '@inrupt/solid-client-authn-browser'
import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react'
import { foaf } from 'rdf-namespaces'

type MutationData = {
  add: [string, string, string][]
  remove: [string, string, string][]
}

type FetchShape = {
  [key: string]: string
}

const solidQuery =
  (): BaseQueryFn<
    { uri: string; fetchProperties: FetchShape; data: MutationData },
    unknown,
    unknown
  > =>
  async ({ uri, data, fetchProperties }) => {
    const dataset = await getSolidDataset(uri, { fetch })

    let changedDataset: (SolidDataset & WithChangeLog) | undefined

    data.add.forEach(([subject, predicate, object]) => {
      const thing =
        getThing(changedDataset ?? dataset, subject) ??
        createThing({ url: subject })

      const updatedThing = addUrl(thing, predicate, object)
      changedDataset = setThing(changedDataset ?? dataset, updatedThing)
    })

    data.remove.forEach(([subject, predicate, object]) => {
      const thing = getThing(changedDataset ?? dataset, subject)
      if (thing) {
        const updatedThing = removeUrl(thing, predicate, object)
        changedDataset = setThing(changedDataset ?? dataset, updatedThing)
      }
    })

    if (changedDataset) {
      await saveSolidDatasetAt(uri, changedDataset, { fetch })
    }

    const returnThing = getThing(changedDataset ?? dataset, uri)
    if (!returnThing)
      return {
        error: { message: 'thing not found' },
      }
    const returnData = Object.fromEntries(
      Object.entries(fetchProperties).map(([key, value]) => [
        key,
        getUrlAll(returnThing, value),
      ]),
    )

    return {
      data: returnData,
    }
  }

// Define a service using a base URL and expected endpoints
export const solidApi = createApi({
  reducerPath: 'solidapi',
  baseQuery: solidQuery(),
  tagTypes: ['PersonalInterests'],
  endpoints: build => ({
    readInterests: build.query<string[], string>({
      query: uri => ({
        uri,
        data: { add: [], remove: [] },
        fetchProperties: { interests: foaf.topic_interest },
      }),
      providesTags: (result, error, uri) => [
        { type: 'PersonalInterests', id: uri },
      ],
      transformResponse: ({ interests }: { interests: string[] }) => interests,
    }),
    addInterest: build.mutation<
      { interests: string[] },
      { uri: string; interest: string }
    >({
      query: ({ uri, interest }) => ({
        uri,
        data: { add: [[uri, foaf.topic_interest, interest]], remove: [] },
        fetchProperties: { interests: foaf.topic_interest },
      }),
      invalidatesTags: (result, error, { uri }) => [
        { type: 'PersonalInterests', id: uri },
      ],
    }),
    removeInterest: build.mutation<
      { interests: string[] },
      { uri: string; interest: string }
    >({
      query: ({ uri, interest }) => ({
        uri,
        data: { add: [], remove: [[uri, foaf.topic_interest, interest]] },
        fetchProperties: { interests: foaf.topic_interest },
      }),
      invalidatesTags: (result, error, { uri }) => [
        { type: 'PersonalInterests', id: uri },
      ],
    }),
  }),
})

/*

https://www.wikidata.org/w/api.php?action=wbsearchentities&search=bulying&language=en&limit=20&continue=0&format=json&uselang=en&type=item&origin=*

*/
