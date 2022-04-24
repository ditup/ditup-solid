import TagList from './TagList'
import { DitThing } from './types'
import { Link } from 'react-router-dom'

const DitItem = ({ thing }: { thing: DitThing }) => (
  <div>
    <header>
      <span>icon: {thing.type}</span>{' '}
      <Link to={`/items/${encodeURIComponent(thing.uri)}`}>{thing.label}</Link>{' '}
      <a href={thing.uri}>link</a>
    </header>
    <section>{thing.description}</section>
    <section>
      <TagList tags={thing.tags} />
    </section>
  </div>
)

export default DitItem
