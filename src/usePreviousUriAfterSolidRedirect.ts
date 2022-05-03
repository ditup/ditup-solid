import { onSessionRestore } from '@inrupt/solid-client-authn-browser'
import { useNavigate } from 'react-router-dom'
import './App.css'

const usePreviousUriAfterSolidRedirect = () => {
  const navigate = useNavigate()

  onSessionRestore(url => {
    navigate(new URL(url).pathname)
  })
}

export default usePreviousUriAfterSolidRedirect
