import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import { useAppDispatch, useAppSelector } from './app/hooks'
import CreateDit from './CreateDit'
import DitItemPage from './DitItemPage'
import DitList from './DitList'
import { init, selectLogin } from './features/login/loginSlice'
import Header from './Header'
import Homepage from './Homepage'
import Person from './Person'
import Signup from './Signup'
import EditDitPage from './EditDitPage'

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
          <Route path="/" element={<Homepage />} />
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
        <Route path="/create" element={<CreateDit />} />
        <Route path="/items/:itemUri" element={<DitItemPage />} />
        <Route path="/items/:itemUri/edit" element={<EditDitPage />} />
      </Routes>
    </div>
  )
}

export default App
