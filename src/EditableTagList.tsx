import { FC, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { interestApi } from './app/services/interestApi'
import { useQueries } from './app/services/useQueries'
import InterestSearchInput from './InterestSearchInput'

interface Props {
  tags: string[]
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
}

const EditableTagList: FC<Props> = ({ tags, onAddTag, onRemoveTag }) => {
  const tagsToFind = useMemo(
    () => tags.filter(uri => uri.includes('wikidata')),
    [tags],
  )

  const tagQueries = useQueries(interestApi.endpoints.readInterest, tagsToFind)

  const fetchedTags = tagQueries
    .filter(query => query.data)
    .map(query => query.data)
    .filter(a => a) as { uri: string; label: string; description: string }[]

  const combinedTags = tags.map(uri => {
    const tag = fetchedTags.find(i => i.uri === uri) ?? {
      uri,
      label: uri.split('/').pop(),
      description: uri,
    }
    return tag
  })

  return (
    <div>
      <ul
        style={{
          display: 'flex',
          listStyleType: 'none',
          flexWrap: 'wrap',
          paddingLeft: 0,
        }}
      >
        {combinedTags.map(tag => (
          <li
            style={{ margin: '10px' }}
            key={tag.uri}
            title={
              tag.description.slice(0, 300) +
              (tag.description.length > 300 ? '...' : '')
            }
          >
            <Link to={`/tags/${encodeURIComponent(tag.uri)}`}>{tag.label}</Link>
            <button
              onClick={() => {
                onRemoveTag(tag.uri)
              }}
            >
              remove
            </button>
          </li>
        ))}
      </ul>
      <InterestSearchInput onSelect={tag => onAddTag(tag.uri)} />
    </div>
  )
}

export default EditableTagList
