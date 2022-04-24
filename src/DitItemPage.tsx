import { skipToken } from '@reduxjs/toolkit/query'
import { useParams } from 'react-router-dom'
import { solidApi } from './app/services/solidApi'
import DitItem from './DitItem'
import { Link } from 'react-router-dom'

const DitItemPage = () => {
  const { itemUri } = useParams<'itemUri'>()

  const { data, isLoading, isUninitialized } =
    solidApi.endpoints.readDitItem.useQuery(itemUri ?? skipToken)

  if (!itemUri) return <>No Content...</>
  if (isLoading || isUninitialized) return <div>Loading...</div>
  if (!data) return <div>Not Found</div>

  return (
    <>
      <DitItem thing={data} />
      <aside>
        <Link to={`/items/${encodeURIComponent(itemUri)}/edit`}>Edit</Link>{' '}
        <button>DANGER: Remove</button>
      </aside>
    </>
  )
}

export default DitItemPage
