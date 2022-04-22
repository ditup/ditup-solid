import React, { useEffect, useMemo, useState } from 'react'
import { interestApi } from './app/services/interestApi'
import SearchInput from './SearchInput'
import { skipToken } from '@reduxjs/toolkit/query/react'
import debounce from 'lodash.debounce'

const InterestSearchInput = ({
  onSelect,
}: {
  onSelect: (uri: string) => void
}) => {
  const [query, setQuery] = useState('')

  const [debouncedQuery, setDebouncedQuery] = useState('')

  const debouncedSet = useMemo(() => debounce(setDebouncedQuery, 500), [])

  useEffect(() => {
    debouncedSet(query)
  }, [query, debouncedSet])

  const { data: interests, isLoading } =
    interestApi.endpoints.searchInterests.useQuery(debouncedQuery || skipToken)

  const handleSelect = (uri: string) => {
    onSelect(uri)
    setQuery('')
  }
  return (
    <SearchInput
      value={query}
      options={((query && interests) || []).map(
        ({ label, description, uri }) => ({
          label: `${label}: ${description}`,
          value: uri,
        }),
      )}
      isLoading={isLoading}
      onChange={setQuery}
      onSelect={handleSelect}
    />
  )
}

export default InterestSearchInput
