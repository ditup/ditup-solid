import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Interest } from '../../types'

export const interestApi = createApi({
  reducerPath: 'interestapi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://www.wikidata.org/w/',
  }),
  tagTypes: ['Interest'],
  endpoints: build => ({
    searchInterests: build.query<Interest[], string>({
      query: query => ({
        url: `api.php?action=wbsearchentities&search=${encodeURIComponent(
          query,
        )}&language=en&limit=20&continue=0&format=json&uselang=en&type=item&origin=*`,
      }),
      // Pick out data and prevent nested properties in a hook or selector
      transformResponse: (response: {
        search: { concepturi: string; label: string; description: string }[]
      }) =>
        response.search.map(({ concepturi, label, description }) => ({
          uri: concepturi,
          label,
          description,
        })),
      //*/
      providesTags: (result, error, query) =>
        (result ?? ([] as Interest[]))
          .map(({ uri }) => ({ type: 'Interest' as const, id: uri }))
          .concat([{ type: 'Interest', id: 'QUERY_STRING_' + query }]),
    }),
    readInterest: build.query<Interest, string>({
      query: uri => {
        const id = uri.match(wikidataRegex)?.[2] ?? ''
        return {
          url: `api.php?action=wbgetentities&ids=${id}&languages=en&format=json&origin=*`,
        }
      },
      transformResponse: (
        response: {
          entities: {
            [key: string]: {
              labels: { en?: { value: string } }
              descriptions: { en?: { value: string } }
            }
          }
        },
        meta,
        uri,
      ) => {
        const entity = Object.values(response.entities)[0]
        if (!entity) throw new Error('entity not found')
        return {
          uri,
          label: entity.labels.en?.value ?? '',
          description: entity.descriptions.en?.value ?? '',
        }
      },
      providesTags: (result, error, uri) => [{ type: 'Interest', id: uri }],
    }),
  }),
})

const wikidataRegex =
  /^https?:\/\/(w{3}\.)?wikidata\.org\/entity\/([A-Z0-9]*)\/?$/
/*
export const getInterest = async (uri: string): Promise<Interest> => {
  const wikidataId = uri.match(wikidataRegex)?.[2] ?? ''
  const dbpediaId = uri.match(dbpediaRegex)?.[2] ?? ''
  const dataUri = wikidataId
    ? `https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.ttl`
    : dbpediaId
    ? `https://dbpedia.org/data/${dbpediaId}.ttl`
    : uri
  const rawData = await (await fetchTurtle(dataUri)).text()
  return await parseInterest(rawData, uri)
}*/
