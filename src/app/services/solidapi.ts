// Need to use the React-specific entry point to import createApi
import {
  addUrl,
  createSolidDataset,
  createThing,
  getSolidDataset,
  getThing,
  getUrlAll,
  removeUrl,
  saveSolidDatasetAt,
  setStringWithLocale,
  setThing,
  SolidDataset,
  WithChangeLog,
} from '@inrupt/solid-client'
import { fetch } from '@inrupt/solid-client-authn-browser'
import { BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react'
import capitalize from 'lodash.capitalize'
import { as, dc, foaf, rdf, rdfs } from 'rdf-namespaces'
import { DitThingSimple, Uri } from '../../types'

type Triple = [string, string, string]

type MutationData = {
  add?: Triple[]
  remove?: Triple[]
  setString?: Triple[] // TODO think about language strings
}

type FetchShape = {
  [key: string]: string
}

const solidQuery =
  (): BaseQueryFn<
    { uri: string; fetchProperties: FetchShape; data?: MutationData },
    unknown,
    unknown
  > =>
  async ({ uri, data, fetchProperties }) => {
    let dataset: SolidDataset
    try {
      dataset = await getSolidDataset(uri, { fetch })
    } catch (e) {
      dataset = createSolidDataset()
    }

    let changedDataset: (SolidDataset & WithChangeLog) | undefined

    if (data?.remove)
      data.remove.forEach(([subject, predicate, object]) => {
        const thing = getThing(changedDataset ?? dataset, subject)
        if (thing) {
          const updatedThing = removeUrl(thing, predicate, object)
          changedDataset = setThing(changedDataset ?? dataset, updatedThing)
        }
      })

    if (data?.setString)
      data.setString.forEach(([subject, predicate, object]) => {
        const thing =
          getThing(changedDataset ?? dataset, subject) ??
          createThing({ url: subject })
        if (thing) {
          const updatedThing = setStringWithLocale(
            thing,
            predicate,
            object,
            'en',
          )
          changedDataset = setThing(changedDataset ?? dataset, updatedThing)
        }
      })

    if (data?.add)
      data.add.forEach(([subject, predicate, object]) => {
        const thing =
          getThing(changedDataset ?? dataset, subject) ??
          createThing({ url: subject })

        const updatedThing = addUrl(thing, predicate, object)
        changedDataset = setThing(changedDataset ?? dataset, updatedThing)
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
        data: {
          add: [[uri, foaf.topic_interest, interest]],
        },
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
        data: { remove: [[uri, foaf.topic_interest, interest]] },
        fetchProperties: { interests: foaf.topic_interest },
      }),
      invalidatesTags: (result, error, { uri }) => [
        { type: 'PersonalInterests', id: uri },
      ],
    }),
    createDit: build.mutation<unknown, { webId: Uri; thing: DitThingSimple }>({
      query: ({ thing }) => ({
        uri: thing.uri,
        data: {
          add: [
            [
              thing.uri,
              rdf.type,
              `https://ditup.example#${capitalize(thing.type)}`,
            ],
            ...thing.tags.map(tag => [thing.uri, as.tag, tag] as Triple),
          ],
          setString: [
            [thing.uri, rdfs.label, thing.label],
            [thing.uri, dc.description, thing.description],
          ],
        },
        fetchProperties: {},
      }),
    }),
  }),
})

/*

https://www.wikidata.org/w/api.php?action=wbsearchentities&search=bulying&language=en&limit=20&continue=0&format=json&uselang=en&type=item&origin=*

*/
