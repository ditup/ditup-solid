import { FormEventHandler, useState } from 'react'
import styles from './DitItemForm.module.scss'
import EditableTagList from './EditableTagList'
import { DitThing, DitType, Uri } from './types'

const TYPE_OPTIONS: DitType[] = ['idea', 'problem']

interface DitThingEmptyOption extends Omit<DitThing, 'type'> {
  type: DitType | ''
}

interface DitItemFormProps {
  thing: DitThingEmptyOption
  onSubmit: (data: DitThing) => void
  disabled?: boolean
}

const DitItemForm = ({
  thing,
  onSubmit,
  disabled = false,
}: DitItemFormProps) => {
  const [type, setType] = useState(thing.type)
  const [label, setLabel] = useState(thing.label)
  const [description, setDescription] = useState(thing.description)
  const [tags, setTags] = useState(thing.tags)
  const [uri, setUri] = useState(thing.uri)

  const handleAddTag = (tagUri: Uri) => {
    if (!tags.find(tag => tag === tagUri)) setTags(tags => [...tags, tagUri])
    else {
      console.log('tag already in list')
    }
  }

  const handleRemoveTag = (tagUri: Uri) => {
    if (!tags.find(tag => tag === tagUri))
      throw new Error('tag not in list (should not happen!)')

    setTags(tags => tags.filter(t => t !== tagUri))
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault()
    if (!type) return
    onSubmit({ type, uri, label, description, tags })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <select
        value={type}
        defaultValue=""
        onChange={e => setType(e.target.value as DitType)}
      >
        <option disabled value="">
          {' '}
          -- select type --{' '}
        </option>
        {TYPE_OPTIONS.map(option => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <input type="text" value={uri} onChange={e => setUri(e.target.value)} />
      <input
        type="text"
        value={label}
        onChange={e => setLabel(e.target.value)}
      />
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        cols={30}
        rows={10}
      ></textarea>

      <EditableTagList
        tags={tags}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
      />

      <input type="submit" value="Save" disabled={disabled} />
    </form>
  )
}

export default DitItemForm
