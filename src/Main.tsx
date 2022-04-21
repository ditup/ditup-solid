import React from 'react'
import { Link } from 'react-router-dom'
import Login from './features/login/Login'
import logo from './logo.png'

const Main = () => (
  <div>
    <h1>ditup</h1>
    <p>do it together</p>
    <img src={logo} alt="mushroom" />
    <Login />
    <Link to="/signup">Get started with Solid?</Link>
  </div>
)

export default Main
