import { DitThing } from './types'

const DitItem = ({ thing }: { thing: DitThing }) => (
  <div>
    <header>
      <span>icon</span> {thing.label} <a href={thing.uri}>link</a>
    </header>
    <section>{thing.description}</section>
    <section>
      <ul>
        {thing.tags.map(tag => (
          <li key={tag.uri}>
            <a title={tag.description}>{tag.label}</a>
          </li>
        ))}
      </ul>
    </section>
  </div>
)

export default DitItem
