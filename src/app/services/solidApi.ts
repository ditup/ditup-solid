// Need to use the React-specific entry point to import createApi
import {
  addUrl,
  createSolidDataset,
  createThing,
  getSolidDataset,
  getStringEnglishAll,
  getStringNoLocaleAll,
  getThing,
  getThingAll,
  getUrlAll,
  removeUrl,
  saveSolidDatasetAt,
  setStringWithLocale,
  setThing,
  SolidDataset,
  ThingPersisted,
  WithChangeLog,
} from '@inrupt/solid-client'
import { fetch } from '@inrupt/solid-client-authn-browser'
import { BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react'
import { as, dc, foaf, rdf, rdfs, vcard } from 'rdf-namespaces'
import { ditUris } from '../../config'
import { DitThing, DitType, Person, Uri } from '../../types'

type Triple = [string, string, string]

type MutationData = {
  add?: Triple[]
  remove?: Triple[]
  setString?: Triple[] // TODO think about language strings
}

type FetchShape = {
  [key: string]: string
}

type QueryResponse = {
  [key: string]: string[]
  uri: string[] /* this fixes an annoying TS error */
}

interface QueryParams {
  uri: string
  fetchProperties: FetchShape
  data?: MutationData
  fetchAll?: boolean
}

const solidQuery =
  (): BaseQueryFn<QueryParams, QueryResponse[]> =>
  async ({ uri, data, fetchProperties, fetchAll = false }: QueryParams) => {
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

    let returnThings: ThingPersisted[]
    if (!fetchAll) {
      returnThings = [getThing(changedDataset ?? dataset, uri)].filter(
        a => !!a,
      ) as ThingPersisted[]
    } else {
      returnThings = getThingAll(changedDataset ?? dataset)
    }

    const returnData = returnThings.map(returnThing => ({
      ...Object.fromEntries(
        Object.entries(fetchProperties).map(([key, value]) => [
          key,
          [
            ...getUrlAll(returnThing, value),
            ...getStringEnglishAll(returnThing, value),
            ...getStringNoLocaleAll(returnThing, value),
          ],
        ]),
      ),
      uri: [returnThing.url],
    }))

    if (!fetchAll && returnThings.length === 0)
      return {
        error: { message: 'thing not found' },
      }

    return {
      data: returnData,
    }
  }

// Define a service using a base URL and expected endpoints
export const solidApi = createApi({
  reducerPath: 'solidapi',
  baseQuery: solidQuery(),
  tagTypes: ['Person', 'DitThing'],
  endpoints: build => ({
    readPerson: build.query<Person, string>({
      query: uri => ({
        uri,
        fetchProperties: {
          name: foaf.name,
          photo: vcard.hasPhoto,
          interests: foaf.topic_interest,
        },
      }),
      providesTags: (result, error, uri) => [{ type: 'Person', id: uri }],
      transformResponse: ([{ uri, name, photo, interests }]) => ({
        uri: uri[0],
        name: name[0] ?? '',
        photo: photo[0] ?? '',
        interests,
      }),
    }),
    readDitItem: build.query<DitThing, Uri>({
      query: uri => ({
        uri,
        fetchProperties: {
          type: rdf.type,
          label: rdfs.label,
          description: dc.description,
          tags: as.tag,
        },
      }),
      transformResponse: ([{ uri, type, label, description, tags }]) => ({
        uri: uri[0],
        type:
          (Object.keys(ditUris) as DitType[]).find(
            key => ditUris[key] === type[0],
          ) ?? 'idea',
        label: label[0],
        description: description[0],
        tags,
      }),
      providesTags: (result, error, uri) => [{ type: 'DitThing', id: uri }],
    }),
    readDitItems: build.query<DitThing[], Uri>({
      query: uri => ({
        uri,
        fetchAll: true,
        fetchProperties: {
          type: rdf.type,
          label: rdfs.label,
          description: dc.description,
          tags: as.tag,
        },
      }),
      transformResponse: things => {
        return things
          .map(({ uri, type, label, description, tags }) => ({
            uri: uri[0],
            type: (Object.keys(ditUris) as DitType[]).find(key =>
              type.includes(ditUris[key]),
            ),
            label: label[0],
            description: description[0],
            tags,
          }))
          .filter(thing => typeof thing.type !== 'undefined') as DitThing[]
      },
      providesTags: results =>
        (results ?? []).map(result => ({ type: 'DitThing', id: result.uri })),
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
        { type: 'Person', id: uri },
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
        { type: 'Person', id: uri },
      ],
    }),
    createDit: build.mutation<Uri, { webId: Uri; thing: DitThing }>({
      query: ({ thing }) => ({
        uri: thing.uri,
        data: {
          add: [
            [thing.uri, rdf.type, ditUris[thing.type]],
            ...thing.tags.map(tag => [thing.uri, as.tag, tag] as Triple),
          ],
          setString: [
            [thing.uri, rdfs.label, thing.label],
            [thing.uri, dc.description, thing.description],
          ],
        },
        fetchProperties: {},
      }),
      transformResponse: ([
        {
          uri: [uri],
        },
      ]) => uri,
    }),
  }),
})

export const getDitupUri = (webId: string) => {
  const baseUrl = /^(https?:\/\/.*)\/profile\/card#me$/g.exec(webId)?.[1]
  if (!baseUrl) throw new Error('unable to generate hospex uri from webId')
  return baseUrl + '/public/ditup.ttl'
}
