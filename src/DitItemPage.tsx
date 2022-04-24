import { skipToken } from '@reduxjs/toolkit/query'
import { useParams } from 'react-router-dom'
import { solidApi } from './app/services/solidApi'
import DitItem from './DitItem'

const DitItemPage = () => {
  const { itemUri } = useParams<'itemUri'>()

  const { data, isLoading, isUninitialized } =
    solidApi.endpoints.readDitItem.useQuery(itemUri ?? skipToken)

  if (isLoading || isUninitialized || !data) return <div>Loading...</div>

  return <DitItem thing={data} />
}

export default DitItemPage
