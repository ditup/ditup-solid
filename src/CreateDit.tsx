import { FormEventHandler, useState } from 'react'
import { solidApi } from './app/services/solidapi'
import styles from './CreateDit.module.scss'
import EditableTagList from './EditableTagList'
import { DitType, Uri } from './types'
import { useNavigate } from 'react-router-dom'

const TYPE_OPTIONS: DitType[] = ['idea', 'problem']

export const getHospexUri = (webId: string) => {
  const baseUrl = /^(https?:\/\/.*)\/profile\/card#me$/g.exec(webId)?.[1]
  if (!baseUrl) throw new Error('unable to generate hospex uri from webId')
  return baseUrl + '/public/ditup.ttl'
}

const CreateDit = ({ webId }: { webId: string }) => {
  const [type, setType] = useState<DitType>()
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<Uri[]>([])
  const [uri, setUri] = useState(
    `${getHospexUri(webId)}#${globalThis.crypto.randomUUID()}`,
  )

  const [createDit, { isLoading, isSuccess }] =
    solidApi.endpoints.createDit.useMutation()

  const navigate = useNavigate()
  if (isSuccess) {
    navigate(`/items/${encodeURIComponent(uri)}`)
    return null
  }

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
        <select value={type} onChange={e => setType(e.target.value as DitType)}>
          <option disabled selected value="">
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
