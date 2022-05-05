import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchImage } from './api'
import { useAppSelector } from './app/hooks'
import { solidApi } from './app/services/solidApi'
import logo from './assets/main-image.png'
import Discoverability from './Discoverability'
import EditableTagList from './EditableTagList'
import { selectLogin } from './features/login/loginSlice'

const Person = () => {
  const personId = useParams<'personId'>().personId as string
  const loginUri = useAppSelector(selectLogin).webId
  const personUri = personId === 'me' ? loginUri : personId
  const { data, isLoading } = solidApi.endpoints.readPerson.useQuery(personUri)
  const [addInterest] = solidApi.endpoints.addInterest.useMutation()
  const [removeInterest] = solidApi.endpoints.removeInterest.useMutation()
  const [notifyIndex] = solidApi.endpoints.notifyIndex.useMutation()
  const { data: discoverableTags } =
    solidApi.endpoints.readDiscoverability.useQuery(personUri)

  const [image, setImage] = useState(logo)

  useEffect(() => {
    ;(async () => {
      if (data?.photo) {
        const img = await fetchImage(data.photo)
        setImage(img)
      }
    })()
  }, [data?.photo])

  if (!data) return <div>Loading...</div>

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
      <EditableTagList
        tags={data.interests}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
      />
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
      <Discoverability
        uri={personUri}
        tags={data.interests}
        editable={personUri === loginUri}
      />
    </div>
  )
}

export default Person
