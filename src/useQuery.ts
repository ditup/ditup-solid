import { useEffect, useState } from 'react'
import { QueryEngine } from '@comunica/query-sparql/lib/index-browser'
import { Bindings } from '@rdfjs/types'

const myEngine = new QueryEngine()

const useQuery = <Result extends Record<string, string | null>>(
  query: string,
  sources: [string, ...string[]],
): [unknown[], Result[], boolean] => {
  const [results, setResults] = useState<Result[]>([])
  const [errors, setErrors] = useState<unknown[]>([])
  const [inProgress, setInProgress] = useState(false)
  useEffect(() => {
    ;(async () => {
      setResults([])

      const bindingsStream = await myEngine.queryBindings(query, {
        sources,
        lenient: true,
      })

      setInProgress(true)

      // Consume results as a stream (best performance)
      bindingsStream.on('data', (binding: Bindings) => {
        const keys = [...binding.keys()].map(
          ({ value }) => value as keyof ResponseType,
        )

        const result = Object.fromEntries(
          keys.map(key => [key, binding.get(key as string)?.value ?? null]),
        ) as Result

        setResults(results => [...results, result])
      })
      bindingsStream.on('error', error => {
        console.error(error)
        setErrors(errors => [...errors, error])
      })
      bindingsStream.on('end', () => {
        setInProgress(false)
      })
    })()
  }, [query, sources])
  return [errors, results, inProgress]
}

export default useQuery
