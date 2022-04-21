import React, { FormEventHandler, useState } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { login } from './loginSlice'

const Login = () => {
  const [provider, setProvider] = useState('')
  const dispatch = useAppDispatch()
  const handleSubmit: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault()
    dispatch(login(provider))
  }

  return (
    <div>
      <header>Log in with your Solid identity</header>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={provider}
          onChange={e => setProvider(e.target.value)}
          list="providers"
        />
        <datalist id="providers">
          <option value="https://solidcommunity.net">Solid Community</option>
          <option value="https://inrupt.net">Inrupt</option>
        </datalist>
        <input type="submit" value="Log in" disabled={!provider} />
      </form>
    </div>
  )
}

export default Login
