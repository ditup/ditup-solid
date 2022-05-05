import { FC } from 'react'
import { solidApi } from './app/services/solidApi'
import { Uri } from './types'

interface Props {
  editable: boolean
  uri: Uri
  tags: Uri[]
}

const DiscoverabilityAction = ({
  editable,
  disabled,
  indexed,
  tags,
  onPublish,
}: {
  editable: boolean
  disabled: boolean
  indexed: boolean
  tags: Uri[]
  onPublish: () => void
}) => {
  // when it is not editable (not belonging to user) do nothing
  if (!editable) return null
  // when it is already indexed, do nothing, or allow for removing in the future (TODO)
  if (indexed) return null
  // when it is editable and discoverable, but not enough tags, say that they have to add some tags
  const handleClick = () => {
    if (tags.length === 0)
      alert('Please add some topics first, to make this discoverable')
    else {
      onPublish()
    }
  }
  // now, allow to be indexed
  return (
    <button disabled={disabled} onClick={handleClick}>
      publish
    </button>
  )
}

const Discoverability: FC<Props> = ({ editable, uri, tags }) => {
  // @TODO here we're not entirely sure how to deal with an array of index servers, perhaps some of them readonly, and each can have different tags
  // @TODO update the index if the tag count doesn't match

  const { data } = solidApi.endpoints.readDiscoverability.useQuery(uri)
  const [notifyIndex, { isLoading }] =
    solidApi.endpoints.notifyIndex.useMutation()

  if (!data) return null

  const indexed = data.length > 0

  const handlePublish = async () => {
    notifyIndex({ uri, person: 'whatever' })
  }

  return (
    <div>
      {indexed ? (
        <span>
          <i className="icon-eye" /> Indexed
        </span>
      ) : (
        <span>
          <i className="icon-eye-off" /> Unlisted
        </span>
      )}{' '}
      {
        <DiscoverabilityAction
          disabled={isLoading}
          editable={editable}
          indexed={indexed}
          tags={tags}
          onPublish={handlePublish}
        />
      }
    </div>
  )
}

export default Discoverability
