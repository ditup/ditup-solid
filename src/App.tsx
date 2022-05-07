import { Route, Routes } from 'react-router-dom'
import './App.css'
import { useAppSelector } from './app/hooks'
import CreateDit from './CreateDit'
import Discover from './Discover'
import DitItemPage from './DitItemPage'
import EditDitPage from './EditDitPage'
import { selectLogin } from './features/login/loginSlice'
import Header from './Header'
import Homepage from './Homepage'
import MainPage from './MainPage'
import Person from './Person'
import Signup from './Signup'
import TagPage from './TagPage'
import usePreviousUri from './usePreviousUriAfterSolidRedirect'

function App() {
  usePreviousUri()

  const login = useAppSelector(selectLogin)

  if (login.status === 'loading') return <div>initializing</div>

  if (!login.isLoggedIn)
    return (
      <div>
        <Routes>
          <Route path="*" element={<Homepage />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    )
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/people/:personId" element={<Person />} />
        <Route path="/create" element={<CreateDit />} />
        <Route path="/items/:itemUri" element={<DitItemPage />} />
        <Route path="/items/:itemUri/edit" element={<EditDitPage />} />
        <Route path="/tags/:tagUri" element={<TagPage />} />
      </Routes>
    </div>
  )
}

export default App
