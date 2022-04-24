import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchImage } from './api'
import { useAppSelector } from './app/hooks'
import { solidApi } from './app/services/solidApi'
import EditableTagList from './EditableTagList'
import { selectLogin } from './features/login/loginSlice'
import logo from './logo.png'

const Person = () => {
  const personId = useParams<'personId'>().personId as string
  const loginUri = useAppSelector(selectLogin).webId
  const personUri = personId === 'me' ? loginUri : personId
  const { data, isLoading } = solidApi.endpoints.readPerson.useQuery(personUri)
  const [addInterest] = solidApi.endpoints.addInterest.useMutation()
  const [removeInterest] = solidApi.endpoints.removeInterest.useMutation()

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

  return (
    <div>
      <img src={image} style={{ width: '10rem' }} />
      <div>
        {isLoading ? '...' : data.name ?? ''} <a href={personUri}>link</a>
      </div>
      {
        <EditableTagList
          tags={data.interests}
          onAddTag={interest => addInterest({ uri: personUri, interest })}
          onRemoveTag={interest => removeInterest({ uri: personUri, interest })}
        />
      }
      {
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
      }
    </div>
  )
}

export default Person
