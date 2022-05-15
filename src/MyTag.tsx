/*
See if tag is my interest. Add or remove.
*/

import { skipToken } from '@reduxjs/toolkit/dist/query'
import classnames from 'classnames'
import { FC } from 'react'
import { solidApi } from './app/services/solidApi'
import styles from './MyTag.module.scss'
import { Uri } from './types'
import { useLoggedUserWithInfo } from './useLoggedUser'

interface MyTagProps {
  uri: Uri
}

const MyTag: FC<MyTagProps> = ({ uri }) => {
  const [me, { isFetching }] = useLoggedUserWithInfo()

  const [addInterest, { isLoading: isAdding }] =
    solidApi.endpoints.addInterest.useMutation()

  const [removeInterest, { isLoading: isRemoving }] =
    solidApi.endpoints.removeInterest.useMutation()

  const [notifyIndex] = solidApi.endpoints.notifyIndex.useMutation()

  const { data: discoverableTags } =
    solidApi.endpoints.readDiscoverability.useQuery(me?.uri ?? skipToken)

  const isIndexed = discoverableTags?.length ?? 0 > 0

  const isProgress = isFetching || isAdding || isRemoving

  if (!me || !me.interests || isProgress)
    return (
      <i
        className={classnames('icon-load animate-spin', styles.container)}
        aria-hidden="true"
      />
    )

  const handleAdd = async () => {
    await addInterest({ uri: me.uri, interest: uri })
    if (isIndexed)
      await notifyIndex({
        uri: me.uri,
        person: me.uri,
      })
  }

  const handleRemove = async () => {
    await removeInterest({ uri: me.uri, interest: uri })
    if (isIndexed)
      await notifyIndex({
        uri: me.uri,
        person: me.uri,
      })
  }

  const isMine = me.interests.includes(uri)
  const title = isMine
    ? 'This is my interest (Click to remove)'
    : 'Add to my interests'
  const iconClass = isMine ? 'icon-ok' : 'icon-add'

  return (
    <button
      title={title}
      aria-label={title}
      className={classnames(styles.container, isMine && styles.isMine)}
      onClick={isMine ? handleRemove : handleAdd}
    >
      <i className={iconClass} aria-hidden="true" />
    </button>
  )
}

export default MyTag
