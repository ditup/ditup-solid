import { solidApi } from './app/services/solidApi'
import { useAppSelector } from './app/hooks'
import { selectLogin } from './features/login/loginSlice'
import { skipToken } from '@reduxjs/toolkit/dist/query'

const useLoggedUser = () => {
  const webId = useAppSelector(selectLogin).webId
  const { data: me } = solidApi.endpoints.readPerson.useQuery(
    webId || skipToken,
  )
  return me
}

export default useLoggedUser
