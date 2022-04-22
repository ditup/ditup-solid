import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

type Interest = { uri: string; label: string; description: string }

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
  }),
})
