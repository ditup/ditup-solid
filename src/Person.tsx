import React from 'react'
import { useParams } from 'react-router-dom'
import { useAppSelector } from './app/hooks'
import { selectLogin } from './features/login/loginSlice'

const Person = () => {
  const personId = useParams<'personId'>().personId
  const loginUri = useAppSelector(selectLogin).webId
  const uri = personId === 'me' ? loginUri : personId
  return (
    <div>
      <img src="image" />
      <div>Name</div> <a href={uri}>link</a>
      <ul>
        <li>Tag</li>
        <li>tag2</li>
        <li>Tag3</li>
      </ul>
    </div>
  )
}

export default Person
