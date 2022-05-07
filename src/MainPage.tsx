import { useAppSelector } from './app/hooks'
import { selectLogin } from './features/login/loginSlice'
import DitList from './DitList'

const MainPage = () => {
  const { webId } = useAppSelector(selectLogin)

  return <DitList person={webId} />
}

export default MainPage
