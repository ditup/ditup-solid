import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchImage } from './api'
import { useAppSelector } from './app/hooks'
import { solidApi } from './app/services/solidApi'
import logo from './assets/main-image.png'
import Discoverability from './Discoverability'
import DitList from './DitList'
import EditableTagList from './EditableTagList'
import { selectLogin } from './features/login/loginSlice'
import TagList from './TagList'

const Person = () => {
  const personId = useParams<'personId'>().personId as string
  const loginUri = useAppSelector(selectLogin).webId
  const personUri = personId === 'me' ? loginUri : personId
  const { data, isLoading, isUninitialized, isError } =
    solidApi.endpoints.readPerson.useQuery(personUri)
  const [addInterest] = solidApi.endpoints.addInterest.useMutation()
  const [removeInterest] = solidApi.endpoints.removeInterest.useMutation()
  const [notifyIndex] = solidApi.endpoints.notifyIndex.useMutation()
  const { data: discoverableTags } =
    solidApi.endpoints.readDiscoverability.useQuery(personUri)

  const [image, setImage] = useState(logo)

  const isMe = personUri === loginUri

  useEffect(() => {
    ;(async () => {
      if (data?.photo) {
        const img = await fetchImage(data.photo)
        setImage(img)
      }
    })()
  }, [data?.photo])

  if (isLoading || isUninitialized) return <div>Loading...</div>

  if (isError)
    return (
      <div>
        Sorry, we couldn&apos;t find user &quot;{personUri}&quot; for you
      </div>
    )

  const handleAddTag = async (interest: string) => {
    await addInterest({ uri: personUri, interest })
    // update index only if the person is already indexed
    if (discoverableTags?.length ?? 0 > 0)
      await notifyIndex({ uri: personUri, person: personUri })
  }
  const handleRemoveTag = async (interest: string) => {
    await removeInterest({ uri: personUri, interest })
    // update index only if the person is already indexed
    if (discoverableTags?.length ?? 0 > 0)
      await notifyIndex({ uri: personUri, person: personUri })
  }

  const Tags = isMe ? EditableTagList : TagList

  return (
    <div>
      <img src={image} style={{ width: '10rem' }} />
      <div>
        {isLoading ? '...' : data.name ?? ''}{' '}
        <a
          href={personUri}
          title={`Go directly to ${data.name || 'this person'}'s Solid Profile`}
          aria-label={`Go directly to ${
            data.name || 'this person'
          }'s Solid Profile`}
        >
          <i aria-hidden="true" className="icon-external-link" />
        </a>
      </div>
      <Tags
        tags={data.interests}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
      />
      {isMe && (
        <a
          href={`https://www.interesting.chat/?interests=${encodeURIComponent(
            data.interests
              .filter(uri => uri.includes('wikidata'))
              .map(uri => uri.split('/').pop())
              .join(','),
          )}`}
        >
          Chat with a stranger about your interests
        </a>
      )}
      <Discoverability
        uri={personUri}
        tags={data.interests}
        editable={personUri === loginUri}
      />

      <DitList person={personUri} />
    </div>
  )
}

export default Person
