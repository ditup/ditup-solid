import { skipToken } from '@reduxjs/toolkit/query'
import { Navigate, useParams } from 'react-router-dom'
import { useAppSelector } from './app/hooks'
import { solidApi } from './app/services/solidApi'
import DitItemForm from './DitItemForm'
import { selectLogin } from './features/login/loginSlice'
import { DitThingBasic } from './types'
import useLoggedUser from './useLoggedUser'

const EditDitPage = () => {
  const webId = useAppSelector(selectLogin).webId
  const { itemUri } = useParams<'itemUri'>()
  const personUri = useLoggedUser()?.uri
  const { data: discoverableTags } =
    solidApi.endpoints.readDiscoverability.useQuery(itemUri ?? skipToken)

  const { data, isLoading, isUninitialized } =
    solidApi.endpoints.readDitItem.useQuery(itemUri ?? skipToken)

  const [updateDit, { isLoading: isUpdating, isSuccess }] =
    solidApi.endpoints.updateDit.useMutation()

  const [notifyIndex] = solidApi.endpoints.notifyIndex.useMutation()

  if (!personUri) return <>Not Signed In</>

  if (isSuccess && data)
    return <Navigate to={`/items/${encodeURIComponent(data.uri)}`} />

  if (!itemUri) return <>No Content...</>
  if (isLoading || isUninitialized) return <div>Loading...</div>
  if (!data) return <div>Not Found</div>

  const handleSubmit = async (thing: DitThingBasic) => {
    await updateDit({ thing: { ...thing, creator: webId } })
    if (discoverableTags?.length ?? 0 > 0)
      await notifyIndex({ uri: thing.uri, person: personUri })
  }

  return (
    <DitItemForm
      thing={data}
      onSubmit={handleSubmit}
      disabled={isUpdating}
      readonlyUri
    />
  )
}

export default EditDitPage
