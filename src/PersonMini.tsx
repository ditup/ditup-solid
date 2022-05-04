import { useEffect, useState } from 'react'
import { fetchImage } from './api'
import { solidApi } from './app/services/solidApi'
import logo from './assets/main-image.png'
import { Uri } from './types'

const PersonMini = ({ uri }: { uri: Uri }) => {
  const { data } = solidApi.endpoints.readPerson.useQuery(uri)

  const [image, setImage] = useState(logo)

  useEffect(() => {
    ;(async () => {
      if (data?.photo) {
        const img = await fetchImage(data.photo)
        setImage(img)
      }
    })()
  }, [data?.photo])

  if (!data) return null

  return (
    <div>
      <img src={image} style={{ width: '1rem' }} /> {data.name}
    </div>
  )
}

export default PersonMini
