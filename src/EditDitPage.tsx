import { skipToken } from '@reduxjs/toolkit/query'
import { Navigate, useParams } from 'react-router-dom'
import { useAppSelector } from './app/hooks'
import { solidApi } from './app/services/solidApi'
import DitItemForm from './DitItemForm'
import { selectLogin } from './features/login/loginSlice'
import { DitThingBasic } from './types'

const DitItemFormPage = () => {
  const webId = useAppSelector(selectLogin).webId
  const { itemUri } = useParams<'itemUri'>()

  const { data, isLoading, isUninitialized } =
    solidApi.endpoints.readDitItem.useQuery(itemUri ?? skipToken)

  const [updateDit, { isLoading: isUpdating, isSuccess }] =
    solidApi.endpoints.updateDit.useMutation()

  if (isSuccess && data)
    return <Navigate to={`/items/${encodeURIComponent(data.uri)}`} />

  if (!itemUri) return <>No Content...</>
  if (isLoading || isUninitialized) return <div>Loading...</div>
  if (!data) return <div>Not Found</div>

  const handleSubmit = (thing: DitThingBasic) =>
    updateDit({ thing: { ...thing, creator: webId } })

  return (
    <DitItemForm
      thing={data}
      onSubmit={handleSubmit}
      disabled={isUpdating}
      readonlyUri
    />
  )
}

export default DitItemFormPage
