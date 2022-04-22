import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchImage } from './api'
import { useAppSelector } from './app/hooks'
import { ditapi, useGetUserInterests } from './app/services/ditapi'
import { solidApi } from './app/services/solidapi'
import { selectLogin } from './features/login/loginSlice'
import InterestSearchInput from './InterestSearchInput'
import logo from './logo.png'

const Person = () => {
  const personId = useParams<'personId'>().personId as string
  const loginUri = useAppSelector(selectLogin).webId
  const personUri = personId === 'me' ? loginUri : personId
  const { data, isLoading } = ditapi.endpoints.getUser.useQuery(personUri)
  const [addInterest, { isLoading: isAddingInterest }] =
    solidApi.endpoints.addInterest.useMutation()
  const [removeInterest, { isLoading: isRemovingInterest }] =
    solidApi.endpoints.removeInterest.useMutation()

  const { data: interests, isLoading: areInterestsLoading } =
    useGetUserInterests(personUri)

  const { data: personInterests } =
    solidApi.endpoints.readInterests.useQuery(personUri)

  console.log(personInterests)

  const [image, setImage] = useState(logo)

  const combinedInterests = (
    personInterests?.interests ?? ([] as string[])
  ).map(uri => {
    const interest = interests.find(i => i.uri === uri) ?? {
      uri,
      label: uri.split('/').pop(),
      description: uri,
    }
    return interest
  })

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
        {isLoading ? '...' : data?.name ?? ''} <a href={personUri}>link</a>
      </div>
      <ul
        style={{
          display: 'flex',
          listStyleType: 'none',
          flexWrap: 'wrap',
          paddingLeft: 0,
        }}
      >
        {combinedInterests.map(interest => (
          <li
            style={{ margin: '10px' }}
            key={interest.uri}
            title={
              interest.description.slice(0, 300) +
              (interest.description.length > 300 ? '...' : '')
            }
          >
            <a href={interest.uri}>{interest.label}</a>
            <button
              onClick={() => {
                removeInterest({ uri: personUri, interest: interest.uri })
              }}
            >
              remove
            </button>
          </li>
        ))}
        {areInterestsLoading && <li style={{ margin: '10px' }}>...</li>}
      </ul>
      <InterestSearchInput
        onSelect={uri => addInterest({ uri: personUri, interest: uri })}
      />
      {!areInterestsLoading && (
        <a
          href={`https://www.interesting.chat/?interests=${encodeURIComponent(
            interests
              .filter(({ uri }) => uri.includes('wikidata'))
              .map(({ uri }) => uri.split('/').pop())
              .join(','),
          )}`}
        >
          Chat with a stranger about your interests
        </a>
      )}
    </div>
  )
}

export default Person
