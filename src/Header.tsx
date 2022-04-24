import { skipToken } from '@reduxjs/toolkit/dist/query'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { solidApi } from './app/services/solidApi'
import { logout, selectLogin } from './features/login/loginSlice'

const Header = () => {
  const webId = useAppSelector(selectLogin).webId
  const dispatch = useAppDispatch()

  const { data } = solidApi.endpoints.readPerson.useQuery(webId || skipToken)

  return (
    <header>
      <Link to="/">ditup</Link>
      <Link to="/people/me">{!data ? webId : data.name}</Link>
      <Link to="/create">Create</Link>
      <button onClick={() => dispatch(logout())}>log out</button>
    </header>
  )
}

export default Header
