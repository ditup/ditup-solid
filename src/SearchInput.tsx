const SearchInput = ({
  value,
  options,
  isLoading,
  placeholder,
  onChange,
  onSelect,
}: {
  value: string
  options: { label: string; value: string }[]
  isLoading: boolean
  placeholder: string
  onChange: (value: string) => void
  onSelect: (value: string) => void
}) => {
  return (
    <>
      <input
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
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
