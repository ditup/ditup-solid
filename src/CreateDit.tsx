import { FormEventHandler, useState } from 'react'
import { getDitupUri, solidApi } from './app/services/solidApi'
import styles from './CreateDit.module.scss'
import EditableTagList from './EditableTagList'
import { DitType, Uri } from './types'
import { Navigate } from 'react-router-dom'

const TYPE_OPTIONS: DitType[] = ['idea', 'problem']

const CreateDit = ({ webId }: { webId: string }) => {
  const [type, setType] = useState<DitType>()
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<Uri[]>([])
  const [uri, setUri] = useState(
    `${getDitupUri(webId)}#${globalThis.crypto.randomUUID()}`,
  )

  const [createDit, { isLoading, isSuccess }] =
    solidApi.endpoints.createDit.useMutation()

  if (isSuccess) return <Navigate to={`/items/${encodeURIComponent(uri)}`} />

  const handleSubmit: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault()
    if (!type) return
    createDit({ webId, thing: { type, uri, label, description, tags } })
    console.log('finished handling')
  }

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

  return (
    <div>
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

        <input type="submit" value="Create" disabled={isLoading} />
      </form>
    </div>
  )
}

export default CreateDit
