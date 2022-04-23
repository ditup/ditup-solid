import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { ditapi } from './app/services/ditapi'
import { logout, selectLogin } from './features/login/loginSlice'

const Header = () => {
  const webId = useAppSelector(selectLogin)?.webId ?? ''
  const dispatch = useAppDispatch()

  const { data, isLoading } = ditapi.endpoints.getUser.useQuery(webId)

  return (
    <header>
      <Link to="/">ditup</Link>
      <Link to="/people/me">{isLoading ? webId : data?.name}</Link>
      <Link to="/create">Create</Link>
      <button onClick={() => dispatch(logout())}>log out</button>
    </header>
  )
}

export default Header
