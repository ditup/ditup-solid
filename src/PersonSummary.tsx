import { FC, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchImage } from './api'
import logo from './assets/main-image.png'
import styles from './PersonSummary.module.scss'
import TagList from './TagList'
import { Person } from './types'

interface PersonSummaryProps {
  person: Person
}

const PersonSummary: FC<PersonSummaryProps> = ({ person }) => {
  const [image, setImage] = useState(logo)

  useEffect(() => {
    ;(async () => {
      if (person.photo) {
        const img = await fetchImage(person.photo)
        setImage(img)
      }
    })()
  }, [person.photo])

  return (
    <div className={styles.container}>
      <img className={styles.avatar} src={image} />
      <div>
        <Link to={`/people/${encodeURIComponent(person.uri)}`}>
          {person.name || 'no name found'}
        </Link>{' '}
        <a href={person.uri}>link</a>
      </div>
      <TagList tags={person.interests} />
    </div>
  )
}

export default PersonSummary
