import { QueryEngine } from '@comunica/query-sparql/lib/index-browser'
import { Bindings } from '@rdfjs/types'
import { useEffect, useState } from 'react'

const useQuery = <Result extends Record<string, string | null>>(
  query: string,
  sources: [string, ...string[]],
): [unknown[], Result[], boolean] => {
  const [results, setResults] = useState<Result[]>([])
  const [errors, setErrors] = useState<unknown[]>([])
  const [inProgress, setInProgress] = useState(false)
  useEffect(() => {
    const myEngine = new QueryEngine()
    const bindingsStreamPromise = myEngine.queryBindings(query, {
      sources,
      lenient: true,
    })
    ;(async () => {
      const bindingsStream = await bindingsStreamPromise
      setResults([])

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
        // eslint-disable-next-line no-console
        console.error(error)
        setErrors(errors => [...errors, error])
      })
      bindingsStream.on('end', () => {
        setInProgress(false)
      })
    })()
    return () => {
      ;(async () => {
        const bs = await bindingsStreamPromise
        await bs.close()
        setResults([])
      })()
    }
  }, [query, sources])
  return [errors, results, inProgress]
}

export default useQuery
