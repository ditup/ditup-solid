import { skipToken } from '@reduxjs/toolkit/dist/query'
import { useAppSelector } from './app/hooks'
import { solidApi } from './app/services/solidApi'
import { selectLogin } from './features/login/loginSlice'

const useLoggedUser = () => {
  const webId = useAppSelector(selectLogin).webId
  const { data: me } = solidApi.endpoints.readPerson.useQuery(
    webId || skipToken,
  )
  return me
}

export default useLoggedUser

export const useLoggedUserWithInfo = () => {
  const webId = useAppSelector(selectLogin).webId
  const { data: me, ...info } = solidApi.endpoints.readPerson.useQuery(
    webId || skipToken,
  )
  return [me, info] as const
}
