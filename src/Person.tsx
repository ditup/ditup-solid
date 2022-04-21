import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchImage } from './api'
import { useAppSelector } from './app/hooks'
import { ditapi } from './app/services/ditapi'
import { selectLogin } from './features/login/loginSlice'
import logo from './logo.png'

const Person = () => {
  const personId = useParams<'personId'>().personId as string
  const loginUri = useAppSelector(selectLogin).webId
  const uri = personId === 'me' ? loginUri : personId
  const { data, isLoading } = ditapi.endpoints.getUser.useQuery(uri)

  const [image, setImage] = useState(logo)

  useEffect(() => {
    ;(async () => {
      if (data?.photo) {
        const img = await fetchImage(data.photo)
        setImage(img)
      }
    })()
  }, [data?.photo])

  return (
    <div>
      <img src={image} style={{ width: '10rem' }} />
      <div>
        {isLoading ? '...' : data?.name ?? ''} <a href={uri}>link</a>
      </div>
      <ul>
        <li>Tag</li>
        <li>tag2</li>
        <li>Tag3</li>
      </ul>
    </div>
  )
}

export default Person
