import { Link } from 'react-router-dom'
import Discoverability from './Discoverability'
import styles from './DitItem.module.scss'
import PersonMini from './PersonMini'
import TagList from './TagList'
import { DitThing } from './types'
import useLoggedUser from './useLoggedUser'

const ditIcon = {
  idea: 'icon-idea',
  problem: 'icon-problem',
} as const

const DitItem = ({ thing }: { thing: DitThing }) => {
  const myself = useLoggedUser()
  return (
    <div className={styles.ditContainer}>
      <header>
        <span
          className={styles.ditType}
          title={thing.type}
          aria-label={thing.type}
        >
          <i aria-hidden="true" className={ditIcon[thing.type]} />
        </span>{' '}
        <Link to={`/items/${encodeURIComponent(thing.uri)}`}>
          {thing.label}
        </Link>{' '}
        <a href={thing.uri}>
          <i className="icon-external-link" />
        </a>
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
      <aside className={styles.discoverability}>
        <Discoverability
          editable={myself?.uri === thing.creator}
          tags={thing.tags}
          uri={thing.uri}
        />
      </aside>
    </div>
  )
}

export default DitItem
