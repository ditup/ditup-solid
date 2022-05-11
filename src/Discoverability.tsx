import { FC } from 'react'
import { solidApi } from './app/services/solidApi'
import { Uri } from './types'
import useLoggedUser from './useLoggedUser'

interface Props {
  editable: boolean
  uri: Uri
  tags: Uri[]
}

const DiscoverabilityAction = ({
  editable,
  disabled = false,
  indexed,
  tags,
  onPublish,
  onUnpublish,
}: {
  editable: boolean
  disabled?: boolean
  indexed: boolean
  tags: Uri[]
  onPublish: () => void
  onUnpublish: () => void
}) => {
  // when it is not editable (not belonging to user) do nothing
  if (!editable) return null
  // when it is already indexed, allow to be removed from index
  if (indexed) {
    const handleUnpublish = () => {
      onUnpublish()
    }
    return (
      <button disabled={disabled} onClick={handleUnpublish}>
        unpublish
      </button>
    )
  }
  // when it is editable and discoverable, but not enough tags, say that they have to add some tags
  const handlePublish = () => {
    if (tags.length === 0)
      alert('Please add some topics first, to make this discoverable')
    else {
      onPublish()
    }
  }
  // now, allow to be indexed
  return (
    <button disabled={disabled} onClick={handlePublish}>
      publish
    </button>
  )
}

const Discoverability: FC<Props> = ({ editable, uri, tags }) => {
  // @TODO here we're not entirely sure how to deal with an array of index servers, perhaps some of them readonly, and each can have different tags
  // @TODO update the index if the tag count doesn't match

  const person = useLoggedUser()?.uri
  const {
    data,
    isLoading: isLoadingDiscoverability,
    isFetching: isFetchingDiscoverability,
  } = solidApi.endpoints.readDiscoverability.useQuery(uri)
  const [notifyIndex, { isLoading: isSaving }] =
    solidApi.endpoints.notifyIndex.useMutation()

  if (!person) return null
  if (!data) return null

  const indexed = data.length > 0

  const handlePublish = async () => {
    notifyIndex({ uri, person })
  }

  const handleUnpublish = async () => {
    notifyIndex({ uri, person, action: 'remove' })
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
      {isSaving || isLoadingDiscoverability || isFetchingDiscoverability ? (
        'saving'
      ) : (
        <DiscoverabilityAction
          editable={editable}
          indexed={indexed}
          tags={tags}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
        />
      )}
    </div>
  )
}

export default Discoverability
