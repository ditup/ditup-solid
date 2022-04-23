const SearchInput = ({
  value,
  options,
  isLoading,
  onChange,
  onSelect,
}: {
  value: string
  options: { label: string; value: string }[]
  isLoading: boolean
  onChange: (value: string) => void
  onSelect: (value: string) => void
}) => {
  return (
    <>
      <input value={value} onChange={e => onChange(e.target.value)} />
      {isLoading && 'searching'}
      <ul>
        {options.map(option => (
          <li key={option.value}>
            <button onClick={() => onSelect(option.value)}>
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

export default SearchInput
