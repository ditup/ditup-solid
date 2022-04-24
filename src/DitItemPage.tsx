import { skipToken } from '@reduxjs/toolkit/query'
import { Link, Navigate, useParams } from 'react-router-dom'
import { solidApi } from './app/services/solidApi'
import DitItem from './DitItem'

const DitItemPage = () => {
  const { itemUri } = useParams<'itemUri'>()

  const { data, isLoading, isUninitialized } =
    solidApi.endpoints.readDitItem.useQuery(itemUri ?? skipToken)

  const [removeDit, { isLoading: isRemoving, isSuccess }] =
    solidApi.endpoints.removeDit.useMutation()

  if (isSuccess) return <Navigate to="/" />

  if (!itemUri) return <>No Content...</>
  if (isLoading || isUninitialized) return <div>Loading...</div>
  if (!data) return <div>Not Found</div>

  return (
    <>
      <DitItem thing={data} />
      <aside>
        <Link to={`/items/${encodeURIComponent(itemUri)}/edit`}>Edit</Link>{' '}
        <button disabled={isRemoving} onClick={() => removeDit(itemUri)}>
          DANGER: Remove
        </button>
      </aside>
    </>
  )
}

export default DitItemPage
