import { Link } from 'react-router-dom'
import styles from './DitItem.module.scss'
import PersonMini from './PersonMini'
import TagList from './TagList'
import { DitThing } from './types'

const DitItem = ({ thing }: { thing: DitThing }) => (
  <div className={styles.ditContainer}>
    <header>
      <span>icon: {thing.type}</span>{' '}
      <Link to={`/items/${encodeURIComponent(thing.uri)}`}>{thing.label}</Link>{' '}
      <a href={thing.uri}>link</a>
    </header>
    <section>{thing.description}</section>
    <section>
      <TagList tags={thing.tags} />
    </section>
    {thing.createdAt && (
      <aside>Created {new Date(thing.createdAt).toDateString()}</aside>
    )}
    {thing.updatedAt && (
      <aside>Updated {new Date(thing.updatedAt).toDateString()}</aside>
    )}
    <aside>
      <PersonMini uri={thing.creator} />
    </aside>
  </div>
)

export default DitItem
