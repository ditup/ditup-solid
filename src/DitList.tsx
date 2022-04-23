import DitItem from './DitItem'
import { DitThing } from './types'
import styles from './DitList.module.scss'

const DitList = () => {
  const dits: DitThing[] = [
    {
      type: 'idea',
      uri: 'https://example.com/idea0',
      label: 'This is a label',
      description: 'this is a description of the idea',
      tags: [
        {
          uri: 'example.tag',
          label: 'example tag',
          description: 'example tag description',
        },
        {
          uri: 'example.tag',
          label: 'example tag',
          description: 'example tag description',
        },
        {
          uri: 'example.tag',
          label: 'example tag',
          description: 'example tag description',
        },
      ],
    },
  ]

  return (
    <div>
      <ul className={styles.list}>
        <li>
          <DitItem thing={dits[0]} />
        </li>
        <li>Of</li>
        <li>Issues</li>
        <li>And</li>
        <li>Ideas</li>
      </ul>
    </div>
  )
}

export default DitList
