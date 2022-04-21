import React, { useEffect } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import './App.css'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { init, logout, selectLogin } from './features/login/loginSlice'
import Home from './Home'
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
      <header>
        <Link to="/people/me">{login.webId}</Link>
        <button onClick={() => dispatch(logout())}>log out</button>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/people/:personId" element={<Person />} />
      </Routes>
    </div>
  )
}

export default App
