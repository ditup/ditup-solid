import { Navigate } from 'react-router-dom'
import { useAppSelector } from './app/hooks'
import { getDitupUri, solidApi } from './app/services/solidApi'
import DitItemForm from './DitItemForm'
import { selectLogin } from './features/login/loginSlice'
import { DitThing } from './types'

const CreateDit = () => {
  const webId = useAppSelector(selectLogin).webId

  const [createDit, { isLoading, isSuccess, data }] =
    solidApi.endpoints.createDit.useMutation()

  if (isSuccess && data)
    return <Navigate to={`/items/${encodeURIComponent(data)}`} />

  const handleSubmit = (thing: DitThing) => createDit({ webId, thing })

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
