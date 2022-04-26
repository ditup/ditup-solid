import { FC, useMemo } from 'react'
import { interestApi } from './app/services/interestApi'
import { useQueries } from './app/services/useQueries'

interface Props {
  tags: string[]
}

const TagList: FC<Props> = ({ tags }) => {
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
    <ul
      style={{
        listStyleType: 'none',
        paddingLeft: 0,
      }}
    >
      {combinedTags.map(tag => (
        <li
          style={{ margin: '10px', display: 'inline-block' }}
          key={tag.uri}
          title={
            tag.description.slice(0, 300) +
            (tag.description.length > 300 ? '...' : '')
          }
        >
          <a href={tag.uri}>{tag.label}</a>
        </li>
      ))}
    </ul>
  )
}

export default TagList
