import { Navigate } from 'react-router-dom'
import { getDitupUri, solidApi } from './app/services/solidApi'
import DitItemForm from './DitItemForm'
import { DitThingBasic } from './types'
import useLoggedUser from './useLoggedUser'

const CreateDit = () => {
  const webId = useLoggedUser()?.uri

  const [createDit, { isLoading, isSuccess, data }] =
    solidApi.endpoints.createDit.useMutation()

  if (!webId) return <>Not Logged In</>

  if (isSuccess && data)
    return <Navigate to={`/items/${encodeURIComponent(data)}`} />

  const handleSubmit = (thing: DitThingBasic) => {
    createDit({ thing: { ...thing, creator: webId } })
  }

  return (
    <div>
      <DitItemForm
        thing={{
          type: '',
          uri: `${getDitupUri(webId)}#${globalThis.crypto.randomUUID()}`,
          label: '',
          description: '',
          tags: [],
        }}
        onSubmit={handleSubmit}
        disabled={isLoading}
      />
    </div>
  )
}

export default CreateDit
