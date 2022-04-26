import { FC, useMemo } from 'react'
import { interestApi } from './app/services/interestApi'
import { useQueries } from './app/services/useQueries'
import useLoggedUser from './useLoggedUser'
import listStyles from './HorizontalList.module.scss'
import { Link } from 'react-router-dom'

interface Props {
  tags: string[]
}

const TagList: FC<Props> = ({ tags }) => {
  const tagsToFind = useMemo(
    () => tags.filter(uri => uri.includes('wikidata')),
    [tags],
  )

  const me = useLoggedUser()
  const highlightedTags = me?.interests ?? []

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
    <ul className={listStyles.horizontalList}>
      {combinedTags.map(tag => (
        <li
          key={tag.uri}
          title={
            tag.description.slice(0, 300) +
            (tag.description.length > 300 ? '...' : '')
          }
        >
          <Link
            style={{
              color: highlightedTags.includes(tag.uri) ? 'red' : undefined,
            }}
            to={`/tags/${encodeURIComponent(tag.uri)}`}
          >
            {tag.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default TagList
