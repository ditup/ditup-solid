import { Link } from 'react-router-dom'
import Login from './features/login/Login'
import logo from './assets/main-image.png'
import styles from './Homepage.module.scss'

const Homepage = () => (
  <div className={styles.page}>
    <div className={styles.wrapper}>
      <header>
        <h1>ditup</h1>
        <p>do it together!</p>
      </header>

      <img className={styles.homeImage} src={logo} alt="mushroom" />

      <nav>
        <Login />
        <Link to="/signup">
          <small>Get started with Solid?</small>
        </Link>
      </nav>
    </div>
  </div>
)

export default Homepage
