import { ReactNode } from 'react'
import Masonry from 'react-masonry-css'
import styles from './HorizontalList.module.scss'

const HorizontalList = ({ children }: { children: ReactNode }) => (
  <Masonry
    breakpointCols={{ default: 3, 600: 1, 1200: 2 }}
    className={styles.masonryGrid}
    columnClassName={styles.masonryGridColumn}
  >
    {children}
  </Masonry>
)
export default HorizontalList
