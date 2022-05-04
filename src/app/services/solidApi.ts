// Need to use the React-specific entry point to import createApi
import {
  addUrl,
  createSolidDataset,
  createThing,
  getDatetimeAll,
  getSolidDataset,
  getStringEnglishAll,
  getStringNoLocaleAll,
  getThing,
  getThingAll,
  getUrlAll,
  removeAll,
  removeThing,
  removeUrl,
  saveSolidDatasetAt,
  setDatetime,
  setStringWithLocale,
  setThing,
  setUrl,
  SolidDataset,
  ThingPersisted,
  WithChangeLog,
} from '@inrupt/solid-client'
import { fetch } from '@inrupt/solid-client-authn-browser'
import { BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react'
import { as, dct, foaf, rdf, rdfs, vcard } from 'rdf-namespaces'
import { ditUris } from '../../config'
import { DitThing, DitType, Person, Uri } from '../../types'

type Triple<T = string> = [string, string, T]

type MutationData = {
  add?: Triple[]
  set?: Triple[]
  remove?: Triple[]
  setString?: Triple[] // TODO think about language strings
  setDatetime?: Triple<Date>[]
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
  (): BaseQueryFn<QueryParams, QueryResponse[], { message: string }> =>
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
          if (predicate === '*') {
            changedDataset = removeThing(changedDataset ?? dataset, thing)
          } else if (object === '*') {
            const updatedThing = removeAll(thing, predicate)
            changedDataset = setThing(changedDataset ?? dataset, updatedThing)
          } else {
            const updatedThing = removeUrl(thing, predicate, object)
            changedDataset = setThing(changedDataset ?? dataset, updatedThing)
          }
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

    if (data?.setDatetime)
      data.setDatetime.forEach(([subject, predicate, object]) => {
        const thing =
          getThing(changedDataset ?? dataset, subject) ??
          createThing({ url: subject })
        if (thing) {
          const updatedThing = setDatetime(thing, predicate, object)
          changedDataset = setThing(changedDataset ?? dataset, updatedThing)
        }
      })

    if (data?.set)
      data.set.forEach(([subject, predicate, object]) => {
        const thing =
          getThing(changedDataset ?? dataset, subject) ??
          createThing({ url: subject })
        if (thing) {
          const updatedThing = setUrl(thing, predicate, object)
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
            ...getDatetimeAll(returnThing, value),
          ],
        ]),
      ),
      uri: [returnThing.url],
    }))

    if (
      !fetchAll &&
      returnData.length === 0 &&
      // also don't error when mutation removed the whole thing
      !(data?.remove ?? []).find(([, predicate]) => predicate === '*')
    )
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
          description: dct.description,
          tags: as.tag,
          creator: dct.creator,
          createdAt: dct.created,
          updatedAt: dct.modified,
        },
      }),
      transformResponse: ([
        { uri, type, label, description, tags, creator, createdAt, updatedAt },
      ]) => ({
        uri: uri[0],
        type:
          (Object.keys(ditUris) as DitType[]).find(
            key => ditUris[key] === type[0],
          ) ?? 'idea',
        label: label[0],
        description: description[0],
        tags,
        creator: creator[0],
        createdAt: createdAt[0]
          ? new Date(createdAt[0]).getTime()
          : (undefined as unknown as number), // an ugly hack, just to take care of things without creation date
        updatedAt: updatedAt[0] ? new Date(updatedAt[0]).getTime() : undefined,
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
          description: dct.description,
          tags: as.tag,
          creator: dct.creator,
          createdAt: dct.created,
          updatedAt: dct.modified,
        },
      }),
      transformResponse: things =>
        things
          .map(
            ({
              uri,
              type,
              label,
              description,
              tags,
              creator,
              createdAt,
              updatedAt,
            }) => ({
              uri: uri[0],
              type: (Object.keys(ditUris) as DitType[]).find(key =>
                type.includes(ditUris[key]),
              ),
              label: label[0],
              description: description[0],
              tags,
              creator: creator[0],
              createdAt: createdAt[0]
                ? new Date(createdAt[0]).getTime()
                : undefined,
              updatedAt: updatedAt[0]
                ? new Date(updatedAt[0]).getTime()
                : undefined,
            }),
          )
          .filter(thing => typeof thing.type !== 'undefined') as DitThing[],
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
    createDit: build.mutation<
      Uri,
      { thing: Omit<DitThing, 'createdAt' | 'updatedAt'> }
    >({
      query: ({ thing }) => ({
        uri: thing.uri,
        data: {
          add: [
            [thing.uri, rdf.type, ditUris[thing.type]],
            ...thing.tags.map(tag => [thing.uri, as.tag, tag] as Triple),
          ],
          setString: [
            [thing.uri, rdfs.label, thing.label],
            [thing.uri, dct.description, thing.description],
          ],
          setDatetime: [[thing.uri, dct.created, new Date()]],
          set: [[thing.uri, dct.creator, thing.creator]],
        },
        fetchProperties: {},
      }),
      transformResponse: ([
        {
          uri: [uri],
        },
      ]) => uri,
    }),
    updateDit: build.mutation<
      Uri,
      { thing: Omit<DitThing, 'createdAt' | 'updatedAt'> }
    >({
      query: ({ thing }) => ({
        uri: thing.uri,
        data: {
          set: [
            [thing.uri, rdf.type, ditUris[thing.type]],
            [thing.uri, dct.creator, thing.creator],
          ],
          remove: [[thing.uri, as.tag, '*']],
          add: thing.tags.map(tag => [thing.uri, as.tag, tag] as Triple),
          setString: [
            [thing.uri, rdfs.label, thing.label],
            [thing.uri, dct.description, thing.description],
          ],
          setDatetime: [[thing.uri, dct.modified, new Date()]],
        },
        fetchProperties: {},
      }),
      transformResponse: ([
        {
          uri: [uri],
        },
      ]) => uri,
      invalidatesTags: (result, error, { thing }) => [
        { type: 'DitThing', id: thing.uri },
      ],
    }),
    removeDit: build.mutation<unknown, Uri>({
      query: uri => ({
        uri,
        data: {
          remove: [[uri, '*', '*']],
        },
        fetchProperties: {},
      }),
      invalidatesTags: (result, error, uri) => [{ type: 'DitThing', id: uri }],
    }),
  }),
})

export const getDitupUri = (webId: string) => {
  const baseUrl = /^(https?:\/\/.*)\/profile\/card#me$/g.exec(webId)?.[1]
  if (!baseUrl) throw new Error('unable to generate hospex uri from webId')
  return baseUrl + '/public/ditup.ttl'
}
