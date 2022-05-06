import { QueryEngine } from '@comunica/query-sparql/lib/index-browser'
import { fetch } from '@inrupt/solid-client-authn-browser'
import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { createApi } from '@reduxjs/toolkit/query/react'
import { as, foaf } from 'rdf-namespaces'
import { useMemo } from 'react'
import { indexServers } from '../../config'
import useQuery from '../../useQuery'

type User = {
  name: string
  photo: string
}

const comunicaBaseQuery =
  ({ baseSources }: { baseSources: string[] } = { baseSources: [] }) =>
  async <ResponseType extends Record<string, string | null>>({
    query,
    sources,
  }: {
    query: string
    sources: string[]
  }): Promise<
    QueryReturnValue<ResponseType[], unknown, Record<string, unknown>>
  > => {
    const sparqlEngine = new QueryEngine()

    const bindingsStream = await sparqlEngine.queryBindings(query, {
      sources: [...baseSources, ...sources] as [string, ...string[]],
      fetch,
    })
    return {
      data: (await bindingsStream.toArray()).map(binding => {
        const keys = [...binding.keys()].map(
          ({ value }) => value as keyof ResponseType,
        )

        return Object.fromEntries(
          keys.map(key => [key, binding.get(key as string)?.value ?? null]),
        ) as ResponseType
      }),
    }
  }

export const ditapi = createApi({
  reducerPath: 'ditapi',
  baseQuery: comunicaBaseQuery(),
  endpoints: builder => ({
    getUser: builder.query<User, string>({
      query: (webId: string) => ({
        query: `
          PREFIX foaf: <http://xmlns.com/foaf/0.1/>
          PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>
          SELECT ?name ?photo WHERE {
            <${webId}> foaf:name ?name.
            OPTIONAL {<${webId}> vcard:hasPhoto ?photo.}
          }`,
        sources: [webId],
      }),
      transformResponse: (data: User[]) => data[0],
    }),
    discoverPeople: builder.query<{ uri: string; count: number }[], string>({
      query: (userId: string) => ({
        query: `
          PREFIX foaf: <http://xmlns.com/foaf/0.1/>
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          PREFIX owl: <http://www.w3.org/2002/07/owl#>
          PREFIX dbo: <http://dbpedia.org/ontology/>
          SELECT DISTINCT ?person (COUNT(DISTINCT ?thing) as ?commonCount)
          WHERE {
            <${userId}> foaf:topic_interest ?thing.
            ?person foaf:topic_interest ?thing.
            FILTER(?person != <${userId}>)
          }
          GROUP BY ?person`,
        sources: [userId, ...indexServers],
      }),
      transformResponse: (data: { person: string; commonCount: string }[]) =>
        data.map(({ person, commonCount }) => ({
          uri: person,
          count: +commonCount,
        })),
    }),
    discoverDits: builder.query<{ uri: string; count: number }[], string>({
      query: (userId: string) => ({
        query: `
          SELECT DISTINCT ?dit (COUNT(DISTINCT ?thing) as ?commonCount)
          WHERE {
            <${userId}> <${foaf.topic_interest}> ?thing.
            ?dit <${as.tag}> ?thing.
          }
          GROUP BY ?dit`,
        sources: [userId, ...indexServers],
      }),
      transformResponse: (data: { dit: string; commonCount: string }[]) =>
        data.map(({ dit, commonCount }) => ({
          uri: dit,
          count: +commonCount,
        })),
    }),
  }),
})

export const useGetUserInterests = (userId: string) => {
  const query = useMemo(
    () =>
      `
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  PREFIX dbo: <http://dbpedia.org/ontology/>
  SELECT DISTINCT ?uri ?label ?description
  WHERE {
    {
      <${userId}> foaf:topic_interest ?uri.
      ?uri rdfs:label ?label.
      ?uri dbo:abstract ?description.
    }
    UNION {
      <${userId}> foaf:topic_interest ?uri.
      ?oneUri owl:sameAs ?uri.
      ?oneUri rdfs:label ?label.
      ?oneUri dbo:abstract ?description.
    }
    FILTER(lang(?label)='en')
    FILTER(lang(?description)='en')
  }`,
    [userId],
  )
  const sources: [string, ...string[]] = useMemo(
    () => [
      userId,
      // 'https://query.wikidata.org/sparql',
      'https://query.wikidata.org/bigdata/ldf',
      'https://fragments.dbpedia.org/2016-04/en',
    ],
    [userId],
  )

  const [errors, data, isLoading] = useQuery<{
    uri: string
    label: string
    description: string
  }>(query, sources)
  return { errors, data, isLoading }
}

export const useDiscoverPeople = (userId: string) => {
  const query = useMemo(
    () =>
      `
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  PREFIX dbo: <http://dbpedia.org/ontology/>
  SELECT DISTINCT ?person (COUNT(DISTINCT ?thing) as ?commonCount)
  WHERE {
    <${userId}> foaf:topic_interest ?thing.
    ?person foaf:topic_interest ?thing.
    FILTER(?person != <${userId}>)
  }
  GROUP BY ?person
  `,
    [userId],
  )
  const sources: [string, ...string[]] = useMemo(
    () => [userId, ...indexServers],
    [userId],
  )

  const [errors, data, isLoading] = useQuery<{
    person: string
    commonCount: string
  }>(query, sources)
  return { errors, data, isLoading }
}

/*import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query'
import axios, { AxiosRequestConfig, AxiosError } from 'axios'

const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: '' }
  ): BaseQueryFn<
    {
      url: string
      method: AxiosRequestConfig['method']
      data?: AxiosRequestConfig['data']
      params?: AxiosRequestConfig['params']
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params }) => {
    try {
      const result = await axios({ url: baseUrl + url, method, data, params })
      return { data: result.data }
    } catch (axiosError) {
      let err = axiosError as AxiosError
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      }
    }
  }

const api = createApi({
  baseQuery: axiosBaseQuery({
    baseUrl: 'https://example.com',
  }),
  endpoints(build) {
    return {
      query: build.query({ query: () => ({ url: '/query', method: 'get' }) }),
      mutation: build.mutation({
        query: () => ({ url: '/mutation', method: 'post' }),
      }),
    }
  },
})*/
/*
const bindingsStream = await myEngine.queryBindings(`
  SELECT ?s ?p ?o WHERE {
    ?s ?p <http://dbpedia.org/resource/Belgium>.
    ?s ?p ?o
  } LIMIT 100`, {
  sources: ['http://fragments.dbpedia.org/2015/en'],
});

// Consume results as a stream (best performance)
bindingsStream.on('data', (binding) => {
    console.log(binding.toString()); // Quick way to print bindings for testing

    console.log(binding.has('s')); // Will be true

    // Obtaining values
    console.log(binding.get('s').value);
    console.log(binding.get('s').termType);
    console.log(binding.get('p').value);
    console.log(binding.get('o').value);
});
bindingsStream.on('end', () => {
    // The data-listener will not be called anymore once we get here.
});
bindingsStream.on('error', (error) => {
    console.error(error);
});

// Consume results as an array (easier)
const bindings = await bindingsStream.toArray();
console.log(bindings[0].get('s').value);
console.log(bindings[0].get('s').termType);
*/
