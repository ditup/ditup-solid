import { skipToken } from '@reduxjs/toolkit/dist/query'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { solidApi } from './app/services/solidApi'
import { logout, selectLogin } from './features/login/loginSlice'
import styles from './Header.module.scss'

const Header = () => {
  const webId = useAppSelector(selectLogin).webId
  const dispatch = useAppDispatch()

  const { data } = solidApi.endpoints.readPerson.useQuery(webId || skipToken)

  return (
    <header className={styles.header}>
      <Link className={styles.homeLink} to="/">
        <span className={styles.logo}>
          <i className="icon-ditup" aria-hidden="true" />
        </span>
        ditup
      </Link>
      <span className={styles.separator} />
      <Link to="/discover">Discover</Link>
      <Link to="/create">Create</Link>
      <Link to="/people/me">{!data ? webId : data.name}</Link>
      <button onClick={() => dispatch(logout())}>log out</button>
    </header>
  )
}

export default Header
