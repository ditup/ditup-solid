import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import { useAppDispatch, useAppSelector } from './app/hooks'
import CreateDit from './CreateDit'
import DitList from './DitList'
import { init, selectLogin } from './features/login/loginSlice'
import Header from './Header'
import Main from './Main'
import Person from './Person'
import Signup from './Signup'

function App() {
  const login = useAppSelector(selectLogin)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(init())
  }, [dispatch])

  if (login.status === 'loading') return <div>initializing</div>

  if (!login.isLoggedIn)
    return (
      <div>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    )
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<DitList />} />
        <Route path="/people/:personId" element={<Person />} />
        <Route path="/create" element={<CreateDit webId={login.webId} />} />
      </Routes>
    </div>
  )
}

export default App
