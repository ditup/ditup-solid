import { skipToken } from '@reduxjs/toolkit/dist/query'
import { useParams } from 'react-router-dom'
import { interestApi } from './app/services/interestApi'

const TagPage = () => {
  const tagUri = useParams<'tagUri'>().tagUri

  const { data, isLoading, isUninitialized } =
    interestApi.endpoints.readInterest.useQuery(tagUri || skipToken)

  if (isLoading || isUninitialized) return <>Loading...</>

  if (!data) return <>No data</>

  return (
    <div>
      {data.image && (
        <img
          style={{
            float: 'right',
            width: '20em',
            maxWidth: '40vw',
            margin: '-1.34rem 0 0 0',
          }}
          src={data.image}
          alt={`Image of ${data.label}`}
        />
      )}
      <header>
        <h1>{data.label}</h1>
        <p>{data.aliases.join(' • ')}</p>
        <small>
          <a href={data.uri}>{data.uri}</a>
        </small>
        {data.officialWebsite && (
          <p>
            website: <a href={data.officialWebsite}>{data.officialWebsite}</a>
          </p>
        )}
      </header>
      <section style={{ backgroundColor: 'pink' }}>{data.description}</section>
    </div>
  )
}

export default TagPage
